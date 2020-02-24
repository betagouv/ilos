import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';
import { serviceProvider } from '@ilos/common';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { LogAction } from './actions/LogAction';
import { CustomProvider } from '../Providers/CustomProvider';

@serviceProvider({
  config: __dirname,
  providers: [CustomProvider],
  handlers: [HelloAction, ResultAction, LogAction],
  queues: ['string'],
  connections: [[RedisConnection, 'redis']],
})
export class ServiceProvider extends BaseServiceProvider {
  async init() {
    await super.init();
    this.getContainer()
      .get(CustomProvider)
      .set('string:');
  }
}
