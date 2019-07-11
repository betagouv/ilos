import { Kernel as BaseKernel, Extensions } from '@ilos/core';
import { Commands, CommandExtension } from '@ilos/cli';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { LoggerExtension } from '@ilos/logger';
import { QueueExtension } from '@ilos/queue';
import { kernel, ExtensionStaticInterface } from '@ilos/common';

@kernel({
  env: null,
  config: process.cwd(),
  commands: [
    Commands.CallCommand,
    Commands.ListCommand,
    Commands.ScaffoldCommand,
  ],
})
export class Kernel extends BaseKernel {
  readonly extensions: ExtensionStaticInterface[] = [
    EnvExtension,
    ConfigExtension,
    LoggerExtension,
    ConnectionManagerExtension,
    CommandExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
    QueueExtension,
  ];
}
