import { Command } from 'commander';
import { Container, Interfaces } from '@ilos/core';

/**
 * Commander provider
 * @export
 * @class CommandProvider
 * @extends {Command}
 * @implements {ProviderInterface}
 */
@Container.provider()
export class CommandProvider extends Command implements Interfaces.ProviderInterface {
  boot() {
    //
  }

  output(...args: any[]) {
    console.log(...args);
  }
}
