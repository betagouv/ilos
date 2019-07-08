import { Container, Parents, Types, Exceptions } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { CustomProvider } from '../../Providers/CustomProvider';

@Container.handler({
  service: 'string',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
    public custom: CustomProvider,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    if (Array.isArray(params) || !('name' in params)) {
      throw new Exceptions.InvalidParamsException();
    }
    const sentence = this.config.get('string.hello');
    return `${this.custom.get()}${sentence} ${params.name}`;
  }
}
