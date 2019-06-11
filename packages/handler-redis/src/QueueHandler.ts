import { Job, Queue } from 'bull';
import { Interfaces, Types } from '@ilos/core';
import { EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { bullFactory } from './helpers/bullFactory';

export class QueueHandler implements Interfaces.HandlerInterface {
  public readonly middlewares: (string|[string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  private client: Queue;

  constructor(
    private env: EnvProviderInterfaceResolver,
    private config: ConfigProviderInterfaceResolver,
  ) {
  }

  public boot() {
    const redisUrl = this.config.get('redisUrl');
    const env = this.env.get('NODE_ENV');

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