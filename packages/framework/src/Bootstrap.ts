import { Bootstrap as BaseBootstrap, Types, CliTransport } from '@ilos/cli';
import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';

import { Kernel } from './Kernel';

export class Bootstrap extends BaseBootstrap {
  static defaultBootstrap: Types.BootstrapType = {
    kernel: () => new Kernel(),
    transport: {
      cli: (k) => new CliTransport(k),
      http: (k) => new HttpTransport(k),
      queue: (k) => new QueueTransport(k),
    },
  };
}
