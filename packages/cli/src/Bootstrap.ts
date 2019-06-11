import fs from 'fs';
import path from 'path';
import { Parents, Interfaces } from '@ilos/core';

import { CliTransport } from './transports/CliTransport';
import { BootstrapType } from './types';

export class Bootstrap {
  static defaultBootstrap: BootstrapType = {
    kernel(): Interfaces.KernelInterface {
      class Kernel extends Parents.Kernel {};
      return new Kernel();
    },
    serviceProviders: [],
    transport: {
      cli(k: Interfaces.KernelInterface): Interfaces.TransportInterface { return new CliTransport(k); },
    },
  };

  static setEnvironment():void {
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

  static getBootstrapFile():string {
    const basePath = process.cwd();
    const bootstrapFile = ('npm_package_config_bootstrap' in process.env) ? process.env.npm_package_config_bootstrap : './bootstrap.ts';
  
  
    const bootstrapPath = path.resolve(basePath, bootstrapFile);
  
    if (!fs.existsSync(bootstrapPath)) {
      console.error('No bootstrap file provided');
      process.exit(1);
    }
    return bootstrapPath;
  }

  static async start(bootstrapPath: string, argv: string[], bootstrap?: BootstrapType): Promise<Interfaces.TransportInterface> {
    let fallbackBootstrap: BootstrapType = bootstrap;
    if (!fallbackBootstrap) {
      fallbackBootstrap = this.defaultBootstrap;
    }

    const [_node, _script, command, ...opts] = argv;
  
    let transport;
    const currentBootstrap = await import(bootstrapPath);
    const kernel = ('kernel' in currentBootstrap) ? currentBootstrap.kernel() : fallbackBootstrap.kernel();
    await kernel.boot();
    const serviceProviders = ('serviceProviders' in currentBootstrap) ? currentBootstrap.serviceProviders : fallbackBootstrap.serviceProviders;
  
    for (const serviceProvider of serviceProviders) {
      await kernel.registerServiceProvider(serviceProvider);
    }
    transport = ('transport' in currentBootstrap && command in currentBootstrap.transport) ? 
      currentBootstrap.transport.cli(kernel) : fallbackBootstrap.transport.cli(kernel);
  
    await transport.up(opts);
    
    return transport;
  }

  static async boot(argv: string[], fallbackBootstrap?: BootstrapType) {
    this.setEnvironment();
    const bootstrapPath = this.getBootstrapFile();
    return this.start(bootstrapPath, argv, fallbackBootstrap);
  }
}
