import { Parents, Container } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { LogAction } from './actions/LogAction';
import { CustomProvider } from '../Providers/CustomProvider';

@Container.serviceProvider({
  config: __dirname,
  providers: [
    CustomProvider,
  ],
  handlers: [
    HelloAction,
    ResultAction,
    LogAction,
  ],
  queues: ['string'],
  connections: [
    [RedisConnection, 'redis'],
  ],
})
export class ServiceProvider extends Parents.ServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set('string:');
  }
}
