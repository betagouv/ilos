import { ConfigInterfaceResolver, RegisterHookInterface, ServiceContainerInterface, extension } from '@ilos/common';

import { Config } from './Config';

@extension({
  name: 'config',
  autoload: true,
})
export class ConfigExtension implements RegisterHookInterface {
  constructor(protected readonly params: { [k: string]: any } = {}) {}

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer.bind(Config);
    serviceContainer.registerHooks(Config.prototype, ConfigInterfaceResolver);

    const config = serviceContainer.get(ConfigInterfaceResolver);
    Reflect.ownKeys(this.params).forEach((k: string) => {
      config.set(k, this.params[k]);
    });
  }
}
