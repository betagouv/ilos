import { Command } from 'commander';
import { provider } from '@ilos/container';

import { ProviderInterface } from '../interfaces/ProviderInterface';

/**
 * Commander provider
 * @export
 * @class CommandProvider
 * @extends {Command}
 * @implements {ProviderInterface}
 */
@provider()
export class CommandProvider extends Command implements ProviderInterface {
  boot() {
    //
  }

  output(...args: any[]) {
    console.log(...args);
  }
}
