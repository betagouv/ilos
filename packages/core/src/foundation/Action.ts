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
    const container = serviceContainer.getContainer();
    const middlewares = <(MiddlewareInterface | [MiddlewareInterface, any])[]>this.middlewares.map((value) => {
      if (typeof value === 'string') {
        return <MiddlewareInterface>container.get(value);
      }
      const [key, config] = value;
      const middleware = <MiddlewareInterface>container.get(key);
      return [middleware, config];
    });
    this.wrapper = compose(middlewares);
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    throw new Error('No implementation found');
  }

  public async call(call: CallType): Promise<ResultType> {
    return this.wrapper(call.params, call.context, async (params: ParamsType, context: ContextType) =>
      this.handle(params, context),
    );
  }
}
