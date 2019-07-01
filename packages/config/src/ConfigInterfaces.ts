import { Interfaces } from '@ilos/core';

export interface ConfigInterface extends Interfaces.ProviderInterface {
  loadConfigDirectory(workingPath: string, configDir?: string): void;
  get(key: string, fallback?: any): any;
  set(key: string, value: any): void;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  async boot() {
    return;
  }
  loadConfigDirectory(workingPath: string, configDir?: string): void {
    throw new Error();
  }
  get(key: string, fallback?: any): any {
    throw new Error();
  }

  set(key: string, value: any): void {
    throw new Error();
  }
}
