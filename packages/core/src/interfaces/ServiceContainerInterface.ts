import { ContainerModuleConfigurator, ContainerInterface } from '../container';
import { ServiceProviderInterface } from './ServiceProviderInterface';
import { NewableType } from '../types';
import { ProviderInterface } from './ProviderInterface';

export interface ServiceContainerInterface extends ProviderInterface {
  /**
   * Alias is a shortcut to registrer bindings
   * @example [MyCustomService] will bind MyCustomService to self
   * @example [['custom', MyCustomService]] will bind 'custom' to MyCustomService
   * @type {any[]}
   * @memberof ServiceProviderInterface
   */
  readonly alias: any[];

  /**
   * List of Service providers constructor
   * @type {NewableType<ServiceProviderInterface>[]}
   * @memberof ServiceProviderInterface
   */
  readonly serviceProviders: NewableType<ServiceProviderInterface>[];

  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer():ContainerInterface;

  /**
   * Declare a container module
   * @param {ContainerModuleConfigurator} module
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  register?(module: ContainerModuleConfigurator): Promise<void> | void;

  /**
   * Register service providers
   * @param {NewableType<ServiceProviderInterface>} serviceProviderConstructor
   * @returns {Promise<void>}
   * @memberof ServiceContainerInterface
   */
  registerServiceProvider(serviceProviderConstructor: NewableType<ServiceProviderInterface>): Promise<void>;

  /**
   * Boot is the first method called after constructor
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  boot(): Promise<void> | void;

  /**
   * Shutdown is called to graceful shutdown
   * @returns {Promise<void>}
   * @memberof ServiceContainerInterface
   */
  shutdown(): Promise<void>;


  /**
   * Register a hook on shutdown
   * @param {Function} hook
   * @memberof ServiceContainerInterface
   */
  registerShutdownHook(hook: Function):void;
}

export abstract class ServiceContainerInterfaceResolver implements ServiceContainerInterface {
  readonly alias = [];
  readonly serviceProviders = [];

  getContainer():ContainerInterface {
    throw new Error();
  }

  async boot() {
    return;
  }

  async shutdown(){
    return;
  }

  registerShutdownHook(hook: Function):void {
    throw new Error();
  }

  register(module: ContainerModuleConfigurator) {
    throw new Error();
  }

  async registerServiceProvider(serviceProviderConstructor: NewableType<ServiceProviderInterface>): Promise<void> {
    throw new Error();
  }
}
