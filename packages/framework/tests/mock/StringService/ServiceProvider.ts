import { Parents, Container } from '@ilos/core';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { CustomProvider } from '../Providers/CustomProvider';

@Container.serviceProvider({
  config: __dirname,
  providers: [
    CustomProvider,
  ],
  handlers: [
    HelloAction,
    ResultAction,
  ]
})
export class ServiceProvider extends Parents.ServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set('string:');
  }
}
