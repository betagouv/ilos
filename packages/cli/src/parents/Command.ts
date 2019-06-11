import { Types } from '@ilos/core';
import { CommandOptionType } from '../types';
import { CommandInterface } from '../interfaces';

/**
 * Command parent class, must be decorated
 * @export
 * @abstract
 * @class Command
 * @implements {CommandInterface}
 */
export abstract class Command implements CommandInterface {
  public readonly signature: string;
  public readonly description: string;
  public readonly options: CommandOptionType[] = [];

  public async call(...args: any[]):Promise<Types.ResultType> {
    throw new Error('No implementation found');
  }
}

