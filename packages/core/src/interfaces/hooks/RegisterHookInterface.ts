export interface RegisterHookInterface {
  /**
   * Register hook called before init can declare bindings
   * @returns {(Promise<void> | void)}
   * @memberof RegisterHookInterface
   */
  register(): Promise<void> | void;
}
