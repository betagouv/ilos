import { Interfaces } from '@ilos/core';
import { EnvInterfaceResolver, Env } from '.';

export class EnvExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  static readonly key: string = 'env';
  protected toBeInit = false;

  constructor(
    protected readonly path?: string,
  ) {
    //
  }

  async register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (this.path || !container.isBound(EnvInterfaceResolver)) {
      container.bind(Env).toSelf();
      container.bind(EnvInterfaceResolver).toService(Env);
      serviceContainer.registerHooks(Env.prototype, EnvInterfaceResolver);
      
      this.toBeInit = true;
    }
  }
  
  async init(serviceContainer: Interfaces.ServiceContainerInterface) {
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
