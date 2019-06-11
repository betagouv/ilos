import { Types, Interfaces } from '@ilos/core';
import { handler } from '@ilos/container';

import { QueueHandler } from '../QueueHandler';

export function queueHandlerFactory(service: string, version?: string): Types.NewableType<Interfaces.HandlerInterface> {
  @handler({
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
  