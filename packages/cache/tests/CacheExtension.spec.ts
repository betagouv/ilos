import { expect } from 'chai';
import { serviceProvider, CacheInterfaceResolver } from '@ilos/common';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ConfigExtension } from '@ilos/config';
import { RedisConnection } from '@ilos/connection-redis';
import { EnvExtension } from '@ilos/env';
import { ServiceContainer } from '@ilos/core';
import { CacheExtension } from '../src/CacheExtension';

const connectionString: string = 'APP_REDIS_URL' in process.env ? process.env.APP_REDIS_URL : 'redis://127.0.0.1:6379';
@serviceProvider({
  config: {
    redis: connectionString,
  },
  cache: connectionString,
  connections: [
    [RedisConnection, 'redis'],
  ]
})
class ServiceProvider extends ServiceContainer {
  extensions = [
    CacheExtension,
    ConfigExtension,
    EnvExtension,
    ConnectionManagerExtension,
  ];
}

const sp = new ServiceProvider();
describe('Cache extension', () => {
  after(async () => {
    await sp.destroy();
  })
  it('works', async () => {

    await sp.register();
    await sp.init();

    const cache = sp.get(CacheInterfaceResolver);
    console.log(cache);
  });
});
