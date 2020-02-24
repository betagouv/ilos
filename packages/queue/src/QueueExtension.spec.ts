// tslint:disable max-classes-per-file
import test from 'ava';
import { Action, ServiceProvider, Extensions } from '@ilos/core';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { RedisConnection } from '@ilos/connection-redis';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { EnvInterfaceResolver, handler, provider, serviceProvider } from '@ilos/common';

import { QueueExtension } from './QueueExtension';

@handler({
  service: 'serviceA',
  method: 'hello',
})
class ServiceOneHandler extends Action {}

@handler({
  service: 'serviceB',
  method: 'world',
})
class ServiceTwoHandler extends Action {}

test('Queue extension: should register queue name in container as worker', async (t) => {
  @provider({
    identifier: EnvInterfaceResolver,
  })
  class FakeEnvProvider extends EnvInterfaceResolver {
    get() {
      return true;
    }
  }

  @serviceProvider({
    queues: ['serviceA', 'serviceB'],
    config: {
      redis: {},
    },
    handlers: [ServiceOneHandler, ServiceTwoHandler],
    connections: [[RedisConnection, 'redis']],
    providers: [FakeEnvProvider],
  })
  class MyService extends ServiceProvider {
    extensions = [
      Extensions.Providers,
      ConfigExtension,
      ConnectionManagerExtension,
      Extensions.Handlers,
      QueueExtension,
    ];
  }

  const service = new MyService();
  await service.register();

  const container = service.getContainer();
  const queueRegistrySymbol = QueueExtension.containerKey;
  t.true(container.isBound(queueRegistrySymbol));

  const queueRegistry = container.getAll(queueRegistrySymbol);

  t.true(queueRegistry.indexOf('serviceA') > -1);
  t.true(queueRegistry.indexOf('serviceB') > -1);
  t.is(container.getHandlers().length, 4);
});

test('should register queue name in container and handlers', async (t) => {
  @serviceProvider({
    env: null,
    queues: ['serviceA', 'serviceB'],
    config: {
      redis: {},
    },
    handlers: [ServiceOneHandler, ServiceTwoHandler],
    connections: [[RedisConnection, 'redis']],
  })
  class MyService extends ServiceProvider {
    extensions = [EnvExtension, ConfigExtension, ConnectionManagerExtension, Extensions.Handlers, QueueExtension];
  }

  const service = new MyService();
  await service.register();

  const container = service.getContainer();
  const queueRegistrySymbol = QueueExtension.containerKey;
  t.true(container.isBound(queueRegistrySymbol));

  const queueRegistry = container.getAll(queueRegistrySymbol);
  t.true(queueRegistry.indexOf('serviceA') > -1);
  t.true(queueRegistry.indexOf('serviceB') > -1);
  t.is(container.getHandlers().length, 4);
});
