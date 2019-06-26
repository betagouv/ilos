import { Parents, Types, Interfaces } from '@ilos/core';

import { AddAction } from './actions/AddAction';
import { CustomProvider } from '../Providers/CustomProvider';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly alias = [
    CustomProvider,
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    AddAction,
  ];

  async boot() {
    await super.boot();
    const customProvider = this.getContainer().get(CustomProvider);
    customProvider.set('math:');
  }
}
