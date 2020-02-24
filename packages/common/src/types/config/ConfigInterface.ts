import { ProviderInterface } from '../core';

export interface ConfigInterface extends ProviderInterface {
  get(key: string, fallback?: any): any;
  set(key: string, value: any): void;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  get(key: string, fallback?: any): any {
    throw new Error();
  }

  set(key: string, value: any): void {
    throw new Error();
  }
}
