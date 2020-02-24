import { get, has } from 'lodash';

import { provider, ConfigInterface, ConfigInterfaceResolver } from '@ilos/common';

/**
 * Config provider
 *
 * set and get values from the config store
 */
@provider({
  identifier: ConfigInterfaceResolver,
})
export class Config implements ConfigInterface {
  constructor(protected config: { [k: string]: any }) {}

  get(key: string, fallback?: any): any {
    if (fallback === undefined && !has(this.config, key)) {
      throw new Error(`Unknown config key '${key}'`);
    }

    return get(this.config, key, fallback);
  }
}
