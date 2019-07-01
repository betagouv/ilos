import { Interfaces, Container, Types, Exceptions } from '@ilos/core';

import { ValidatorInterfaceResolver } from './ValidatorInterface';

@Container.middleware()
export class ValidatorMiddleware implements Interfaces.MiddlewareInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    schema: string,
  ): Promise<Types.ResultType> {
    try {
      await this.validator.validate(params, schema);
    } catch (e) {
      throw new Exceptions.InvalidParamsException(e.message);
    }

    return next(params, context);
  }
}
