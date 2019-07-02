import { Interfaces, Container } from '@ilos/core';
import { EnvInterfaceResolver, Env } from '@ilos/env';
import { ConfigInterfaceResolver } from './ConfigInterfaces';
import { Config } from './Config';

export class ConfigExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  static readonly key: string = 'config';

  constructor(
    protected readonly params: string | { workingPath: string, configDir: string } | { [k: string]: any }
  ) {
    //
  }

  async register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();

    if (!container.isBound(EnvInterfaceResolver)) {
      container.bind(EnvInterfaceResolver).to(Env);
    }

    container.bind(ConfigInterfaceResolver).to(Config);
  }

  async init(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const config = container.get(ConfigInterfaceResolver);

    if (typeof this.params === 'string') {
      config.loadConfigDirectory(this.params);
    } else if (!!this.params.workingPath && !!this.params.configDir) {
      config.loadConfigDirectory(this.params.workingPath, this.params.configDir);
    } else {
      Reflect.ownKeys(this.params).forEach((k: string) => {
        config.set(k, this.params[k]);
      })
    }
  }
}
