export interface DestroyHookInterface {
  /**
   * Destroy hook, called before destroy if provided
   * @returns {(Promise<void> | void)}
   * @memberof DestroyHookInterface
   */
  destroy(): Promise<void> | void;
}
