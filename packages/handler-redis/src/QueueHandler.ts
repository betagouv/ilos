import { Job, Queue } from 'bull';
import { Interfaces, Types } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';

import { bullFactory } from './helpers/bullFactory';

export class QueueHandler implements Interfaces.HandlerInterface {
  public readonly middlewares: (string|[string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  private client: Queue;

  constructor(
    private redis: RedisConnection,
  ) {
    this.client = bullFactory(this.service, this.redis);
  }

  public async call(call: Types.CallType): Promise<Job> {
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
