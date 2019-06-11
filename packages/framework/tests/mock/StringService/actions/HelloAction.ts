import { Container, Parents, Types, Exceptions } from '@ilos/core';

@Container.handler({
  service: 'string',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    if (Array.isArray(params) || !('name' in params)) {
      throw new Exceptions.InvalidParamsException();
    }
    return `Hello world ${params.name}`;
  }
}
