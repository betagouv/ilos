import { RPCCallType, RPCResponseType, ResultType, ContextType, ParamsType, NewableType } from '../types';
import { ServiceContainerInterface, ServiceContainerInterfaceResolver } from './ServiceContainerInterface';
import { BootstrapHookInterface } from './hooks/BootstrapHook';
import { ShutdownHookInterface } from './hooks/ShutdownHook';

export interface KernelInterface extends ServiceContainerInterface, BootstrapHookInterface, ShutdownHookInterface {

  /**
   * Handle an RPC call and provide an RPC response
   * @param {RPCCallType} call
   * @returns {(Promise<RPCResponseType | void>)}
   * @memberof KernelInterface
   */
  handle(call: RPCCallType): Promise<RPCResponseType | void>;

  call(method: string, params: ParamsType, context: ContextType): Promise<ResultType>;

  notify(method: string, params: ParamsType, context: ContextType): Promise<void>;
}

export abstract class KernelInterfaceResolver extends ServiceContainerInterfaceResolver implements KernelInterface {
   async handle(call: RPCCallType): Promise<RPCResponseType|void> {
    throw new Error();
  }

  async call(method: string, params: ParamsType, context: ContextType): Promise<ResultType> {
    throw new Error();
  }

  async notify(method: string, params: ParamsType, context: ContextType): Promise<void> {
    throw new Error();
  }

  async bootstrap() {
    throw new Error();
  }

  async shutdown() {
    throw new Error();
  }
}
