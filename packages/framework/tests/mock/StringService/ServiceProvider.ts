import { Parents } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';

export class ServiceProvider extends Parents.ServiceProvider {
  handlers = [
    HelloAction,
    ResultAction,
  ];

  async boot() {
    const config = this.getContainer().get(ConfigProviderInterfaceResolver);
    config.loadConfigDirectory(__dirname);
    await super.boot();
  }
}
