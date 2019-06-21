import { ContainerInterface, ContainerModuleConfigurator } from '../container';
import { ServiceProviderInterface } from './ServiceProviderInterface';
import { RPCCallType, RPCResponseType, ResultType, ContextType, ParamsType, NewableType } from '../types';
import { ServiceContainerInterface } from './ServiceContainerInterface';

export interface KernelInterface extends ServiceContainerInterface {

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

export abstract class KernelInterfaceResolver implements KernelInterface {
  readonly alias = [];
  readonly serviceProviders = [];

  getContainer():ContainerInterface {
    throw new Error();
  }

  async boot() {
    return;
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
