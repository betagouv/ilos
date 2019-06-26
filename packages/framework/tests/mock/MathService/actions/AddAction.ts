import { Container, Parents, Types, Exceptions } from '@ilos/core';
import { CustomProvider } from '../../Providers/CustomProvider';

@Container.handler({
  service: 'math',
  method: 'add',
})
export class AddAction extends Parents.Action {
  constructor(
    public custom: CustomProvider,
  ) {
    super();
  }

  protected async handle(params: Types.ParamsType, context: Types.ContextType): Promise<Types.ResultType> {
    if (!Array.isArray(params)) {
      throw new Exceptions.InvalidParamsException();
    }
    let result = 0;
    params.forEach((add: number) => {
      result += add;
    });
    return `${this.custom.get()}${result}`;
  }
}
