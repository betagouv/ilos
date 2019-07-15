import { CommandOptionType } from './CommandOptionType';
import { ResultType } from '../call';

export interface CommandInterface {
  /**
   * Signature is an unique identifier for command
   * @type {string}
   * @memberof CommandInterface
   */
  readonly signature: string;


  /**
   * Description of the command
   * @type {string}
   * @memberof CommandInterface
   */
  readonly description: string;


  /**
   * Options of the command
   * @type {CommandOptionType[]}
   * @memberof CommandInterface
   */
  readonly options: CommandOptionType[];


  /**
   * Command handler, put here your business logic
   * @param {...any[]} args
   * @returns {Promise<ResultType>}
   * @memberof CommandInterface
   */
  call(...args: any[]): Promise<ResultType>;
}
