import {
  CallType,
  ResultType,
  ParamsType,
  ContextType,
  HandlerInterface,
  FunctionMiddlewareInterface,
  MiddlewareInterface,
  ServiceContainerInterface,
  InitHookInterface,
} from '@ilos/common';

import { compose } from '../helpers/compose';

/**
 * Action parent class, must be decorated
 * @export
 * @abstract
 * @class Action
 * @implements {HandlerInterface}
 */
export abstract class Action implements HandlerInterface, InitHookInterface {
  private wrapper: FunctionMiddlewareInterface = async (params, context, handle) => handle(params, context);
  public readonly middlewares: (string | [string, any])[] = [];

  async init(serviceContainer: ServiceContainerInterface) {
    
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    throw new Error('No implementation found');
  }

  public async call(call: CallType): Promise<ResultType> {
    return this.handle(call.params, call.context);
  }
}
