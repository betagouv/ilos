import { bootstrap as baseBootstrap, Bootstrap, CliTransport } from '@ilos/cli';
import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';
import { BootstrapType } from '@ilos/common';

import { Kernel } from './Kernel';

const defaultBootstrap: BootstrapType = {
  kernel: () => Kernel,
  transport: {
    cli: k => new CliTransport(k),
    http: k => new HttpTransport(k),
    queue: k => new QueueTransport(k),
  },
  serviceProviders: [],
};

export const bootstrap = baseBootstrap.create(defaultBootstrap);
export { Bootstrap };
