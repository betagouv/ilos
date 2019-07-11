import { ProviderInterface } from '../core';
import { InitHookInterface } from '../hooks';

export interface ConfigInterface extends ProviderInterface, InitHookInterface {
  loadConfigDirectory(workingPath: string, configDir?: string): void;
  get(key: string, fallback?: any): any;
  set(key: string, value: any): void;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  async init() {
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
