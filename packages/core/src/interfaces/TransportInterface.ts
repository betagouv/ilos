import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  /**
   * Get Kernel instance
   * @returns {KernelInterface}
   * @memberof TransportInterface
   */
  getKernel(): KernelInterface;

  /**
   * Get Server instance such as httpServer, queue, etc.
   * @returns {any | void}
   * @memberof TransportInterface
   */
  getServer(): any | void;

  /**
   * Start the transport
   * @param {string[]} [opts]
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  up(opts?: string[]): Promise<void>;

  /**
   * Stop the transport
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  down(): Promise<void>;
}
