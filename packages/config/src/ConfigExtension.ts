import { ConfigInterfaceResolver, RegisterHookInterface, ServiceContainerInterface, extension } from '@ilos/common';

import { Config } from './Config';

@extension({
  name: 'config',
  autoload: true,
})
export class ConfigExtension implements RegisterHookInterface {
  constructor(protected readonly params: { [k: string]: any } = {}) {}

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer
      .getContainer()
      .bind(ConfigInterfaceResolver)
      .toConstantValue(new Config(this.params));
  }
}
