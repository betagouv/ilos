import { ContainerModuleConfigurator } from '@ilos/container';

export interface ProviderInterface {

  /**
   * Boot is the first method called after constructor
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  boot(): Promise<void> | void;


  /**
   * Declare a container module
   * @param {ContainerModuleConfigurator} module
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  register?(module: ContainerModuleConfigurator): Promise<void> | void;
}