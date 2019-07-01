import { Interfaces } from '@ilos/core';

import { CommandRegistry } from '../providers/CommandRegistry';

/**
 * Cli Transport
 * @export
 * @class CliTransport
 * @implements {TransportInterface}
 */
export class CliTransport implements Interfaces.TransportInterface {
  kernel: Interfaces.KernelInterface;

  constructor(kernel: Interfaces.KernelInterface) {
    this.kernel = kernel;
  }

  getInstance(): void {
    return;
  }

  getKernel(): Interfaces.KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    this.kernel
      .getContainer()
      .get<CommandRegistry>(CommandRegistry)
      .parse(opts);
  }

  async down() {
    return;
  }
}
