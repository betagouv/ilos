import { Job, Queue } from 'bull';
import { Interfaces, Types } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';

import { bullFactory } from './helpers/bullFactory';

export class QueueHandler implements Interfaces.HandlerInterface, Interfaces.InitHookInterface {
  public readonly middlewares: (string|[string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  private client: Queue;

  constructor(
    protected redis: RedisConnection,
  ) {}

  public async init() {
    this.client = bullFactory(this.service, this.redis.getClient());
  }

  public async call(call: Types.CallType): Promise<Job> {
    if (!this.client) {
      throw new Error('Redis queue handler initialization error');
    }

    try {
      const { method, params, context } = call;
      const job = await this.client.add(method, {
        method,
        jsonrpc: '2.0',
        id: null,
        params: {
          params,
          _context: context,
        },
      });

      return job;
    } catch (e) {
      throw new Error('An error occured');
    }
  }
}
