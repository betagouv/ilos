import { Types, Interfaces } from '@ilos/core';

/**
 * Command parent class, must be decorated
 * @export
 * @abstract
 * @class Command
 * @implements {CommandInterface}
 */
export abstract class Command implements Interfaces.CommandInterface {
  public readonly signature: string;
  public readonly description: string;
  public readonly options: Types.CommandOptionType[] = [];

  public async call(...args: any[]):Promise<Types.ResultType> {
    throw new Error('No implementation found');
  }
}

