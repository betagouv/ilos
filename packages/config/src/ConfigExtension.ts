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
  autoload: true,
})
export class ConfigExtension implements RegisterHookInterface, InitHookInterface {
  constructor(
    protected readonly params: string | { workingPath: string; configDir: string } | { [k: string]: any } = {},
  ) {}

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer.bind(Config);
    serviceContainer.registerHooks(Config.prototype, ConfigInterfaceResolver);
    // TODO: Refactoring
    this.load(serviceContainer);
  }

  async init(serviceContainer: ServiceContainerInterface) {
    // this.load(serviceContainer);
  }

  protected load(serviceContainer: ServiceContainerInterface) {
    const config = serviceContainer.get(ConfigInterfaceResolver);
    serviceContainer.ensureIsBound(EnvInterfaceResolver);

    if (typeof this.params === 'string') {
      config.loadConfigDirectory(this.params);
      return;
    }

    if (this.params.workingPath && this.params.configDir) {
      config.loadConfigDirectory(this.params.workingPath, this.params.configDir);
      return;
    }

    Reflect.ownKeys(this.params).forEach((k: string) => {
      config.set(k, this.params[k]);
    });
  }
}
