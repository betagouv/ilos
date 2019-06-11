import { Container, Parents, Types, Exceptions, Interfaces } from '@ilos/core';

@Container.handler({
  service: 'string',
  method: 'result',
})
export class ResultAction extends Parents.Action {
  constructor(private kernel: Interfaces.KernelInterfaceResolver) {
    super();
  }

  protected async handle(params: Types.ParamsType, context: Types.ContextType): Promise<Types.ResultType> {
    if (Array.isArray(params) || !('name' in params) || !('add' in params) || (!Array.isArray(params.add))) {
      throw new Exceptions.InvalidParamsException();
    }
    const addResult = await <Promise<Types.RPCSingleResponseType>>this.kernel.handle({
      jsonrpc: '2.0',
      method: 'math:add',
      id: 1,
      params: params.add,
    });
    if (addResult && 'result' in addResult) {
      return `Hello world ${params.name}, result is ${addResult.result}`;
    }
    throw new Error('Something goes wrong');
  }
}
