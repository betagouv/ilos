import { Job, Queue } from 'bull';
import { Interfaces, Types } from '@ilos/core';
import { EnvInterfaceResolver } from '@ilos/env';
import { ConfigInterfaceResolver } from '@ilos/config';

import { bullFactory } from './helpers/bullFactory';

export class QueueHandler implements Interfaces.HandlerInterface {
  public readonly middlewares: (string|[string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  private client: Queue;

  constructor(
    private env: EnvInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
  }

  public boot() {
    const redisUrl = this.config.get('queue.connexionString');
    const env = this.env.get('APP_ENV');

    this.client = bullFactory(`${env}-${this.service}`, redisUrl);
  }

  public async call(call: Types.CallType): Promise<Job> {
    try {
      const { method, params, context } = call;
      // TODO : add channel ?
      await this.client.isReady();

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
