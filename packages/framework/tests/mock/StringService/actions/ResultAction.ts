import { Parents, Exceptions } from '@ilos/core';
import {
  handler,
  ParamsType,
  ContextType,
  ResultType,
  RPCSingleResponseType,
  KernelInterfaceResolver
} from '@ilos/common';

import { CustomProvider } from '../../Providers/CustomProvider';

@handler({
  service: 'string',
  method: 'result',
})
export class ResultAction extends Parents.Action {  
  constructor(
    private kernel: KernelInterfaceResolver,
    public custom: CustomProvider,
  ) {
    super();
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (Array.isArray(params) || !('name' in params) || !('add' in params) || (!Array.isArray(params.add))) {
      throw new Exceptions.InvalidParamsException();
    }
    const addResult = await <Promise<RPCSingleResponseType>>this.kernel.handle({
      jsonrpc: '2.0',
      method: 'math:add',
      id: 1,
      params: params.add,
    });
    if (addResult && 'result' in addResult) {
      return `${this.custom.get()}Hello world ${params.name}, result is ${addResult.result}`;
    }
    throw new Error('Something goes wrong');
  }
}
