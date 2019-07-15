// tslint:disable max-classes-per-file
import fs from 'fs';
import path from 'path';
import { kernel, BootstrapType, TransportInterface, KernelInterface, NewableType, ServiceContainerInterface } from '@ilos/common';

import { CliTransport } from '@ilos/cli';
import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';

import { Kernel } from './Kernel';

const defaultBootstrapObject: BootstrapType = {
  kernel: () => Kernel,
  transport: {
    cli: k => new CliTransport(k),
    http: k => new HttpTransport(k),
    queue: k => new QueueTransport(k),
  },
  serviceProviders: [],
};

export class Bootstrap {
  constructor(
    public bootstrapObject: BootstrapType = {},
  ) {}

  static getWorkingPath(): string {
    const basePath = process.cwd();
    if (!('npm_package_config_workingDir' in process.env)) {
      return basePath;
    }
    return path.resolve(basePath, process.env.npm_package_config_workingDir);
  }

  static setPaths(): void {
    process.env.APP_ROOT_PATH = process.cwd();
    process.chdir(Bootstrap.getWorkingPath());
    process.env.APP_WORKING_PATH = process.cwd();
  }

  static setEnv(): void {
    process.env.APP_ENV = ('NODE_ENV' in process.env && process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV : 'dev';
  }

  static setEnvFromPackage():void {
    // Define config from npm package
    Reflect.ownKeys(process.env)
    .filter((key: string) => /npm_package_config_app/.test(key))
    .forEach((key: string) => {
      const oldKey = key;
      const newKey = key.replace('npm_package_config_', '').toUpperCase();
      if (!(newKey in process.env)) {
        process.env[newKey] = process.env[oldKey];
      }
    });
  }

  static getBootstrapFilePath(): string {
    const basePath = Bootstrap.getWorkingPath();
    const bootstrapFile = ('npm_package_config_bootstrap' in process.env) ?
      process.env.npm_package_config_bootstrap : './bootstrap.js';

    const bootstrapPath = path.resolve(basePath, bootstrapFile);
    if (!fs.existsSync(bootstrapPath)) {
      console.error(`No bootstrap file provided (${bootstrapPath})`);
      return;
    }
    return bootstrapPath;
  }

  static create(bootstrapObject: BootstrapType): Bootstrap {
    return new Bootstrap({ ...defaultBootstrapObject, ...bootstrapObject });
  }

  static async createFromPath(bootstrapPath: string = Bootstrap.getBootstrapFilePath()): Promise<Bootstrap> {
    let currentBootstrap = {
      bootstrap: {},
    };

    if (!bootstrapPath) {
      currentBootstrap = await import(bootstrapPath);
    }

    return new Bootstrap({ ...defaultBootstrapObject, ...currentBootstrap.bootstrap });
  }

  get serviceProviders(): NewableType<ServiceContainerInterface>[] {
    return this.bootstrapObject.serviceProviders;
  }

  async start(command: string | TransportInterface, ...opts: any[]): Promise<TransportInterface> {
    let options = [...opts];

    const bootstrapObject = this.bootstrapObject;

    const kernelConstructor = bootstrapObject.kernel();

    const serviceProviders = 'serviceProviders' in bootstrapObject ? bootstrapObject.serviceProviders : [];

    @kernel({
      children: serviceProviders,
    })
    class CustomKernel extends kernelConstructor {}

    const kernelInstance = new CustomKernel();
    await kernelInstance.bootstrap();

    let transport: TransportInterface;

    if (typeof command !== 'string') {
      transport = command;
    } else if (command !== 'cli' && (command in bootstrapObject.transport)) {
      transport = bootstrapObject.transport[command](kernelInstance);
    } else {
      transport = bootstrapObject.transport.cli(kernelInstance);
      options = [
        '',
        '',
        command,
        ...opts,
      ];
    }

    await transport.up(options);

    this.registerShutdownHook(kernelInstance, transport);

    return transport;
  }

  protected registerShutdownHook(kernelInstance: KernelInterface, transport: TransportInterface) {
    function handle() {
      setTimeout(
        () => {
          process.exit(0);
        },
        5000,
      );

      transport.down()
        .then(() => {
          kernelInstance.shutdown()
            .then(() => {
              process.exit(0);
            })
            .catch(() => {
              process.exit(1);
            });
        })
        .catch(() => {
          process.exit(1);
        });
    }

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
  }

  async boot(command: string, ...opts: any[]) {
    Bootstrap.setPaths();
    Bootstrap.setEnv();
    Bootstrap.setEnvFromPackage();

    return this.start(command, ...opts);
  }
}
