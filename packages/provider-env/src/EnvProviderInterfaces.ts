import { Interfaces } from '@ilos/core';

export interface EnvProviderInterface extends Interfaces.ProviderInterface {
  loadEnvFile(envDirectory: string, envFile?: string): void;
  get(key: string, fallback?: any): any;
};

export abstract class EnvProviderInterfaceResolver implements EnvProviderInterface {
  async boot() {
    throw new Error();
  }
  loadEnvFile(envDirectory: string, envFile?: string): void {
    throw new Error();
  }
  get(key: string, fallback?: any): any {
    throw new Error();
  }
}
