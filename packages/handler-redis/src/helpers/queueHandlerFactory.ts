import { Container, Types, Interfaces } from '@ilos/core';

import { QueueHandler } from '../QueueHandler';

export function queueHandlerFactory(service: string, version?: string): Types.NewableType<Interfaces.HandlerInterface> {
  @Container.handler({
    service,
    version,
    method: '*',
    local: false,
    queue: true,
  })
  class CustomQueueHandler extends QueueHandler {
    readonly service: string = service;
    readonly version: string = version;
  }

  return CustomQueueHandler;
}

