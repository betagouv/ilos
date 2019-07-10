import { Container, Types } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';

import { QueueHandler } from '../QueueHandler';

export function queueHandlerFactory(service: string, version?: string): Types.NewableType<QueueHandler> {
  @Container.handler({
    service,
    version,
    method: '*',
    local: true,
    queue: true,
  })
  class CustomQueueHandler extends QueueHandler {
    readonly service: string = service;
    readonly version: string = version;


    constructor(
      protected redis: RedisConnection,
    ) {
      super(redis);
    }
  }

  return CustomQueueHandler;
}

