import {
  EnvInterfaceResolver,
  ConfigInterfaceResolver,
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  extension,
} from '@ilos/common';

import { EnvExtension } from '@ilos/env';

import { Config } from './Config';

@extension({
  name: 'config',
  require: [EnvExtension],
})
export class ConfigExtension implements RegisterHookInterface, InitHookInterface {
  constructor(protected readonly params: string | { workingPath: string; configDir: string } | { [k: string]: any }) {}

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();

    if (!container.isBound(EnvInterfaceResolver)) {
      throw new Error('Unable to find env provider');
    }

    container.bind(Config).toSelf();
    container.bind(ConfigInterfaceResolver).toService(Config);

    serviceContainer.registerHooks(Config.prototype, ConfigInterfaceResolver);
  }

  async init(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const config = container.get(ConfigInterfaceResolver);

    if (typeof this.params === 'string') {
      config.loadConfigDirectory(this.params);
    } else if (this.params.workingPath && this.params.configDir) {
      config.loadConfigDirectory(this.params.workingPath, this.params.configDir);
    } else {
      Reflect.ownKeys(this.params).forEach((k: string) => {
        config.set(k, this.params[k]);
      });
    }
  }
}
