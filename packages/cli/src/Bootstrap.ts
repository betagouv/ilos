// tslint:disable max-classes-per-file
import fs from 'fs';
import path from 'path';

import { Parents, Container } from '@ilos/core';
import { BootstrapType, NewableType, TransportInterface, KernelInterface } from '@ilos/common';

import { CliTransport } from './transports/CliTransport';

export class Bootstrap {
  constructor(
    public bootstrapObject: BootstrapType = {},
  ) {}

  get serviceProviders() {
    return this.bootstrapObject.serviceProviders;
  }

  setEnvironment():void {
    process.env.APP_ROOT_PATH = process.cwd();

    if ('npm_package_config_workingDir' in process.env) {
      process.chdir(path.resolve(process.cwd(), process.env.npm_package_config_workingDir));
    }

    process.env.APP_WORKING_PATH = process.cwd();

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

    process.env.APP_ENV = ('NODE_ENV' in process.env && process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV : 'dev';
  }

  getBootstrapFile():string {
    const basePath = process.cwd();
    const bootstrapFile = ('npm_package_config_bootstrap' in process.env) ?
      process.env.npm_package_config_bootstrap : './bootstrapObject.ts';

    const bootstrapPath = path.resolve(basePath, bootstrapFile);

    if (!fs.existsSync(bootstrapPath)) {
      console.error('No bootstrap file provided');
      return;
    }
    return bootstrapPath;
  }

  async start(command: string, ...opts: any[]): Promise<TransportInterface> {
    const bootstrapObject = this.bootstrapObject;

    const kernelConstructor = bootstrapObject.kernel();

    const serviceProviders = 'serviceProviders' in bootstrapObject ? bootstrapObject.serviceProviders : [];

    @Container.kernel({
      children: serviceProviders,
    })
    class Kernel extends kernelConstructor {}

    const kernel = new Kernel();
    await kernel.bootstrap();

    let transport;

    if (command !== 'cli' && (command in bootstrapObject.transport)) {
      transport = bootstrapObject.transport[command](kernel);
      await transport.up(opts);
    } else {
      transport = bootstrapObject.transport.cli(kernel);
      await transport.up([
        null,
        null,
        command,
        opts,
      ]);
    }

    this.registerShutdownHook(kernel, transport);

    return transport;
  }

  registerShutdownHook(kernel: KernelInterface, transport: TransportInterface) {
    function handle() {
      setTimeout(
        () => {
          process.exit(0);
        },
        5000,
      );

      transport.down()
        .then(() => {
          kernel.shutdown()
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
    this.setEnvironment();
    return this.start(command, opts);
  }

  async createFromPath(): Promise<Bootstrap> {
    const bootstrapPath = this.getBootstrapFile();
    const defaultBootstrap: BootstrapType = { ...this.bootstrapObject };

    let currentBootstrap = {};

    if (bootstrapPath) {
      currentBootstrap = await import(bootstrapPath);
    }
    return new Bootstrap({ ...defaultBootstrap, ...currentBootstrap });
  }

  create(bootstrapObject: BootstrapType): Bootstrap {
    return new Bootstrap({ ...this.bootstrapObject, ...bootstrapObject });
  }
}

export const bootstrap = new Bootstrap({
  kernel(): NewableType<KernelInterface> {
    return class extends Parents.Kernel {};
  },
  serviceProviders: [],
  transport: {
    cli(k: KernelInterface): TransportInterface { return new CliTransport(k); },
  },
});
