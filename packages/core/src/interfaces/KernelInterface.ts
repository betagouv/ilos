import { ContainerInterface, ContainerModuleConfigurator } from '../container';
import { ServiceProviderInterface } from './ServiceProviderInterface';
import { RPCCallType, RPCResponseType, ResultType, ContextType, ParamsType, NewableType } from '../types';

export interface KernelInterface extends ServiceProviderInterface {

  /**
   * Handle an RPC call and provide an RPC response
   * @param {RPCCallType} call
   * @returns {(Promise<RPCResponseType | void>)}
   * @memberof KernelInterface
   */
  handle(call: RPCCallType): Promise<RPCResponseType | void>;
}

export abstract class KernelInterfaceResolver implements KernelInterface {
  readonly alias = [];
  readonly middlewares = [];
  readonly serviceProviders = [];

  getContainer():ContainerInterface {
    throw new Error();
  }

  boot() {
    throw new Error();
  }

  register(module: ContainerModuleConfigurator) {
    throw new Error();
  }

  async handle(call: RPCCallType): Promise<RPCResponseType|void> {
    throw new Error();
  }

  async call(method: string, params: ParamsType, context: ContextType): Promise<ResultType> {
    throw new Error();
  }

  async notify(method: string, params: ParamsType, context: ContextType): Promise<void> {
    throw new Error();
  }

  async registerServiceProvider(serviceProviderConstructor: NewableType<ServiceProviderInterface>): Promise<void> {
    throw new Error();
  }

}
