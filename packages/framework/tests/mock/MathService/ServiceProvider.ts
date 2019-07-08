import { Parents, Container } from '@ilos/core';

import { AddAction } from './actions/AddAction';
import { CustomProvider } from '../Providers/CustomProvider';

@Container.serviceProvider({
  providers: [
    CustomProvider,
  ],
  handlers: [
    AddAction,
  ],
})
export class ServiceProvider extends Parents.ServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set('math:');
  }
}
