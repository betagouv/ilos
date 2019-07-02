import { ContainerInterface } from '../container';

import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';

export interface HandlerInterface {
  readonly middlewares?: (string|[string, any])[];

  /**
   * Handler, put here your business logic
   * @param {CallType} call
   * @returns {Promise<ResultType>}
   * @memberof HandlerInterface
   */
  call(call: CallType):Promise<ResultType>;
}
