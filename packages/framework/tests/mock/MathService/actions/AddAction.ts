import { Container, Parents, Types, Exceptions } from '@ilos/core';

@Container.handler({
  service: 'math',
  method: 'add',
})
export class AddAction extends Parents.Action {
  protected async handle(params: Types.ParamsType, context: Types.ContextType): Promise<Types.ResultType> {
    if (!Array.isArray(params)) {
      throw new Exceptions.InvalidParamsException();
    }
    let result = 0;
    params.forEach((add: number) => {
      result += add;
    });
    return result;
  }
}
