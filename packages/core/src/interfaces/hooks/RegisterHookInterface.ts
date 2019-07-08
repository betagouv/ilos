import { ServiceContainerInterface } from '../ServiceContainerInterface';

export interface RegisterHookInterface {
  /**
   * Register hook called before init can declare bindings
   * @returns {(Promise<void> | void)}
   * @memberof RegisterHookInterface
   */
  register(container?: ServiceContainerInterface): Promise<void> | void;
}
