import { Interfaces } from '@ilos/core';

export interface ConfigProviderInterface extends Interfaces.ProviderInterface {
  loadConfigDirectory(workingPath: string, configDir?: string): void;
  get(key: string, fallback?: any): any;
  set(key: string, value: any): void;
}

export abstract class ConfigProviderInterfaceResolver implements ConfigProviderInterface {
  async boot() {
    throw new Error();
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
