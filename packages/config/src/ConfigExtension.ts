import { Interfaces, Container } from '@ilos/core';
import { EnvInterfaceResolver, Env } from '@ilos/env';
import { ConfigInterfaceResolver } from './ConfigInterfaces';
import { Config } from './Config';

export class ConfigExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  readonly workingPath: string;
  readonly configDir: string;

  constructor(
    protected container: Container.ContainerInterface
  ) {
    //
  }

  async register() {
    if (!this.container.isBound(EnvInterfaceResolver)) {
      this.container.bind(EnvInterfaceResolver).to(Env);
    }

    this.container.bind(ConfigInterfaceResolver).to(Config);
  }

  async init() {
    if (this.workingPath) {
      this.container.get(ConfigInterfaceResolver).loadConfigDirectory(this.workingPath, this.configDir);
    }
  }
}
