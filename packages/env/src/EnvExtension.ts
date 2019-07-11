import {
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  EnvInterfaceResolver,
} from '@ilos/common';

import { Env } from '.';

export class EnvExtension implements RegisterHookInterface, InitHookInterface {
  static readonly key: string = 'env';
  protected toBeInit = false;

  constructor(
    protected readonly path?: string,
  ) {
    //
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (this.path || !container.isBound(EnvInterfaceResolver)) {
      container.bind(Env).toSelf();
      container.bind(EnvInterfaceResolver).toService(Env);
      serviceContainer.registerHooks(Env.prototype, EnvInterfaceResolver);

      this.toBeInit = true;
    }
  }

  async init(serviceContainer: ServiceContainerInterface) {
    if (this.toBeInit) {
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
}
