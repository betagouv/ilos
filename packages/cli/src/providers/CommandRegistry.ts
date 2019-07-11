import * as commander from 'commander';
import { Container } from '@ilos/core';
import { ProviderInterface } from '@ilos/common';

/**
 * Commander provider
 * @export
 * @class CommandProvider
 * @extends {Command}
 * @implements {ProviderInterface}
 */
@Container.provider()
export class CommandRegistry extends commander.Command implements ProviderInterface {
  output(...args: any[]) {
    console.log(...args);
  }
}
