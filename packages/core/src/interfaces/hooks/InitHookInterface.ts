import { ServiceProviderInterface } from "../ServiceProviderInterface";

export interface InitHookInterface {
  /**
   * Init hook, called after register if provided
   * @returns {(Promise<void> | void)}
   * @memberof InitHookInterface
   */
  init(): Promise<void> | void;
}
