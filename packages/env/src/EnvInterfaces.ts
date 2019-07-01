import { Interfaces } from '@ilos/core';

export interface EnvInterface extends Interfaces.ProviderInterface {
  loadEnvFile(envDirectory: string, envFile?: string): void;
  get(key: string, fallback?: any): any;
}

export abstract class EnvInterfaceResolver implements EnvInterface {
  loadEnvFile(envDirectory: string, envFile?: string): void {
    throw new Error();
  }
  get(key: string, fallback?: any): any {
    throw new Error();
  }
}
