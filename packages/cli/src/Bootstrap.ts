import fs from 'fs';
import path from 'path';
import { Parents, Interfaces, Types } from '@ilos/core';

import { CliTransport } from './transports/CliTransport';
import { BootstrapType } from './types';

const defaultBootstrap: BootstrapType = {
  kernel(): Types.NewableType<Interfaces.KernelInterface> {
    return class extends Parents.Kernel {};
  },
  serviceProviders: [],
  transport: {
    cli(k: Interfaces.KernelInterface): Interfaces.TransportInterface { return new CliTransport(k); },
  },
};

export class Bootstrap {
  constructor(
    public defaultBootstrap: BootstrapType
  )
  {
    //
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
    const bootstrapFile = ('npm_package_config_bootstrap' in process.env) ? process.env.npm_package_config_bootstrap : './bootstrap.ts';


    const bootstrapPath = path.resolve(basePath, bootstrapFile);

    if (!fs.existsSync(bootstrapPath)) {
      console.error('No bootstrap file provided');
      return;
    }
    return bootstrapPath;
  }

  async start(argv: string[], bootstrapPath?: string): Promise<Interfaces.TransportInterface> {
    const fallbackBootstrap: BootstrapType = this.defaultBootstrap;

    const [_node, _script, command, ...opts] = argv;
    let bootstrap = { ...fallbackBootstrap };

    if (bootstrapPath) {
      const currentBootstrap = await import(bootstrapPath);
      bootstrap = { ...bootstrap, ...currentBootstrap };
    }
    const kernelConstructor = bootstrap.kernel();

    const serviceProviders = 'serviceProviders' in bootstrap ? bootstrap.serviceProviders : [];

    class Kernel extends kernelConstructor {
      children = [
        ...super.children,
        ...bootstrap.serviceProviders,
      ];
    }
    const kernel = new Kernel();
    await kernel.bootstrap();

    let transport;

    if (command !== 'cli' && (command in bootstrap.transport)) {
      transport = bootstrap.transport[command](kernel);
      await transport.up(opts);
    } else {
      transport = bootstrap.transport.cli(kernel);
      await transport.up(argv);
    }

    this.registerShutdownHook(kernel, transport);
    
    return transport;  
  }

  registerShutdownHook(kernel: Interfaces.KernelInterface, transport: Interfaces.TransportInterface) {
    function handle() {
      setTimeout(() => {
        process.exit(0);
      }, 5000);

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
          process.exit(0);
        });
    }

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
  }

  async boot(argv: string[]) {
    this.setEnvironment();
    const bootstrapPath = this.getBootstrapFile();
    return this.start(argv, bootstrapPath);
  }
}

export const bootstrap = new Bootstrap(defaultBootstrap);
