import { ProviderInterface } from '../core';

export interface ConfigInterface extends ProviderInterface {
  get(key: string, fallback?: any): any;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  get(key: string, fallback?: any): any {
    throw new Error();
  }
}
