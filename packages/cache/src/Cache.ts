import { Redis as RedisInterface } from 'ioredis';
import { provider, CacheInterfaceResolver, CacheInterface, HasLogger, ConnectionInterface } from '@ilos/common';

/**
 * Cache provider
 * @export
 * @class Cache
 * @implements {CacheInterface}
 */
@provider({
  identifier: CacheInterfaceResolver,
})
export class Cache extends HasLogger implements CacheInterface {
  protected readonly namespace: string = 'default';

  constructor(
    private readonly redis: ConnectionInterface<RedisInterface>,
  ) {
    super();
  }

  protected get prefixedNamespace(): string {
    return `namespace:${this.namespace}`;
  }

  async get(key: string, fallback?: any): Promise<any> {
    return this.redis.getClient().get(key)
			.then(value => {
				if (value === null) {
					return fallback;
				}
				return value;
			});
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (typeof value === 'undefined') {
			return;
    }
    if (ttl) {
      await this.redis.getClient().set(key, value, 'PX', ttl);
    } else {
      await this.redis.getClient().set(key, value);
    }
		await this.redis.getClient().sadd(this.prefixedNamespace, key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.getClient().del(key);
    await this.redis.getClient().srem(this.prefixedNamespace, key);
  }

  async clear(): Promise<void> {
    const keys = await this.redis.getClient().smembers(this.prefixedNamespace);
    await this.redis.getClient().del(...keys, this.prefixedNamespace);
  }
}