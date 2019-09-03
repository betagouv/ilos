import { ProviderInterface } from '../core';
import { InitHookInterface, DestroyHookInterface } from '../hooks';

export interface CacheInterface extends ProviderInterface {
  get(key: string, fallback?: any): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export abstract class CacheInterfaceResolver implements CacheInterface {
  async get(key: string, fallback?: any): Promise<any> {
    throw new Error();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    throw new Error();
  }

  async delete(key: string): Promise<void> {
    throw new Error();
  }

  async clear(): Promise<void> {
    throw new Error();
  }
}
