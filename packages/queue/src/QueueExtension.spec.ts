// tslint:disable max-classes-per-file
import { expect } from 'chai';

import { Parents, Extensions } from '@ilos/core';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { RedisConnection } from '@ilos/connection-redis';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import {
  EnvInterfaceResolver,
  handler,
  provider,
  serviceProvider,
} from '@ilos/common';

import { QueueExtension } from './QueueExtension';

@handler({
  service: 'serviceA',
  method: 'hello',
})
class ServiceOneHandler extends Parents.Action {
}

@handler({
  service: 'serviceB',
  method: 'world',
})
class ServiceTwoHandler extends Parents.Action {
}

describe('Queue extension', () => {
  it('should register queue name in container as worker', async () => {
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

    expect(container.getHandlers().length).to.eq(4);
  });

  it('should register queue name in container and handlers', async () => {
    @serviceProvider({
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
