import { Container, Parents, Types, Exceptions } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

@Container.handler({
  service: 'string',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
    private config: ConfigProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    if (Array.isArray(params) || !('name' in params)) {
      throw new Exceptions.InvalidParamsException();
    }
    const sentence = this.config.get('string.hello');
    return `${sentence} ${params.name}`;
  }
}
