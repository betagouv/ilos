import { Interfaces } from '@ilos/core';

export interface EnvInterface extends Interfaces.ProviderInterface, Interfaces.InitHookInterface {
  loadEnvFile(envDirectory: string, envFile?: string): void;
  get(key: string, fallback?: any): any;
}

export abstract class EnvInterfaceResolver implements EnvInterface {
  async init() {
    return;
  }
  loadEnvFile(envDirectory: string, envFile?: string): void {
    throw new Error();
  }
  get(key: string, fallback?: any): any {
    throw new Error();
  }
}
