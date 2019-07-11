import { ProviderInterface } from '../core';
import { InitHookInterface } from '../hooks';

export interface EnvInterface extends ProviderInterface, InitHookInterface {
  loadEnvFile(envFileOrDirectoryPath: string): void;
  get(key: string, fallback?: any): any;
  loadFromProcess(): void;
}

export abstract class EnvInterfaceResolver implements EnvInterface {
  async init() {
    return;
  }

  loadFromProcess(): void {
    throw new Error();
  }

  loadEnvFile(envFileOrDirectoryPath: string): void {
    throw new Error();
  }

  get(key: string, fallback?: any): any {
    throw new Error();
  }
}
