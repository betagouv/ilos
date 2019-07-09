// tslint:disable max-classes-per-file
import { expect } from 'chai';

import { Parents, Container, Extensions } from '@ilos/core';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { RedisConnection } from '@ilos/connection-redis';
import { ConfigExtension } from '@ilos/config';
import { EnvInterfaceResolver, EnvExtension } from '@ilos/env';

import { QueueExtension } from './QueueExtension';

@Container.handler({
  service: 'serviceA',
  method: 'hello',
})
class ServiceOneHandler extends Parents.Action {
}

@Container.handler({
  service: 'serviceB',
  method: 'world',
})
class ServiceTwoHandler extends Parents.Action {
}

describe('Queue extension', () => {
  it('should register queue name in container as worker', async () => {
    @Container.provider({
      identifier: EnvInterfaceResolver,
    })
    class FakeEnvProvider extends EnvInterfaceResolver {
      get() {
        return true;
      }
    }

    @Container.serviceProvider({
      queues: ['serviceA', 'serviceB'],
      config: {
        redis: {},
      },
      handlers: [
        ServiceOneHandler,
        ServiceTwoHandler,
      ],
      connections: [
        [RedisConnection, 'redis'],
      ],
      providers: [
        FakeEnvProvider,
      ],
    })
    class MyService extends Parents.ServiceProvider {
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
    expect(container.isBound(queueRegistrySymbol)).to.eq(true);

    const queueRegistry = container.getAll(queueRegistrySymbol);

    expect(queueRegistry).to.members([
      'serviceA',
      'serviceB',
    ]);

    expect(container.getHandlers().length).to.eq(2);
  });

  it('should register queue name in container and handlers', async () => {
    @Container.serviceProvider({
      env: null,
      queues: ['serviceA', 'serviceB'],
      config: {
        redis: {},
      },
      handlers: [
        ServiceOneHandler,
        ServiceTwoHandler,
      ],
      connections: [
        [RedisConnection, 'redis'],
      ],
    })
    class MyService extends Parents.ServiceProvider {
      extensions = [
        EnvExtension,
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
    expect(container.isBound(queueRegistrySymbol)).to.eq(true);

    const queueRegistry = container.getAll(queueRegistrySymbol);

    expect(queueRegistry).to.members([
      'serviceA',
      'serviceB',
    ]);

    expect(container.getHandlers().length).to.eq(4);
  });
});
