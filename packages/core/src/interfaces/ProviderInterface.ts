export interface ProviderInterface {

  /**
   * Boot is the first method called after constructor
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  boot?(): Promise<void> | void;
}
