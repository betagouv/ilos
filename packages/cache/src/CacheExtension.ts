import {
  RegisterHookInterface,
  ServiceContainerInterface,
  extension,
} from '@ilos/common';

import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { Cache } from './Cache';

@extension({
  name: 'cache',
  require: [ConnectionManagerExtension],
})
export class CacheExtension implements RegisterHookInterface {
  constructor(
    protected readonly params: string,
  ) {}

  async register(serviceContainer: ServiceContainerInterface) {
    // serviceContainer.bind(Cache);
  }
}
