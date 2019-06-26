import { Parents, Types, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { CustomProvider } from '../Providers/CustomProvider';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly alias = [
    CustomProvider,
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    HelloAction,
    ResultAction,
  ];

  async boot() {
    const config = this.getContainer().get(ConfigProviderInterfaceResolver);
    config.loadConfigDirectory(__dirname);
    await super.boot();

    this.getContainer().get(CustomProvider).set('string:');
  }
}
