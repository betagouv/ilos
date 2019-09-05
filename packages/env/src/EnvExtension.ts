import {
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  EnvInterfaceResolver,
  extension,
} from '@ilos/common';

import { LoggerExtension } from '@ilos/logger';

import { Env } from '.';

@extension({
  name: 'env',
  autoload: true,
  require: [LoggerExtension],
})
export class EnvExtension implements RegisterHookInterface, InitHookInterface {
  protected toBeInit = false;

  constructor(protected readonly path?: string) {
    //
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    // TODO : use serviceContainer API
    if (this.path || !container.isBound(EnvInterfaceResolver)) {
      container.bind(Env).toSelf();
      container.bind(EnvInterfaceResolver).toService(Env);
      serviceContainer.registerHooks(Env.prototype, EnvInterfaceResolver);

      // this.toBeInit = true;
      // TODO: Refactoring !!!
      this.load(serviceContainer);
    }
  }

  async init(serviceContainer: ServiceContainerInterface) {
    // if (this.toBeInit) {
    //   this.load(serviceContainer);
    // }
  }

  protected load(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
      const env = container.get(EnvInterfaceResolver);
      let envPath = this.path;

      if (!envPath) {
        envPath = process.env.APP_ROOT_PATH;
      }

      if (!envPath) {
        envPath = process.cwd();
      }

      env.loadEnvFile(envPath);
      env.loadFromProcess();
  }
}
