import fs from 'fs';
import { Container, Parents, Types, Exceptions } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { CustomProvider } from '../../Providers/CustomProvider';

@Container.handler({
  service: 'string',
  method: 'log',
})
export class LogAction extends Parents.Action {
  constructor(
    public custom: CustomProvider,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    if (context && !!context.channel && !!context.channel.transport && context.channel.transport === 'queue') {
      fs.writeFileSync(this.config.get('log.path'), JSON.stringify(params), { encoding:'utf8', flag:'w' });
    }
    return params;
  }
}
