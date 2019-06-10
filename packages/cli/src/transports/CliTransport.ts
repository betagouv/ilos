import { Interfaces } from '@ilos/core';
import { CommandProvider } from '../providers/CommandProvider';


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

  getKernel():Interfaces.KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    this.kernel.getContainer().get<CommandProvider>(CommandProvider).parse(opts);
  }

  async down() {
    return;
  }
}
