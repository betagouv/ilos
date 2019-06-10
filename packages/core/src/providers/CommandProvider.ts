import { Command } from 'commander';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { provider } from '../container';

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
