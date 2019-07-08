import { Parents, Extensions, Interfaces, Container } from '@ilos/core';
import { Commands, CommandExtension } from '@ilos/cli';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { LoggerExtension } from '@ilos/logger';

@Container.kernel({
  env: null,
  config: process.cwd(),
  commands: [
    Commands.CallCommand,
    Commands.ListCommand,
    Commands.ScaffoldCommand,
  ],
})
export class Kernel extends Parents.Kernel {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    EnvExtension,
    ConfigExtension,
    LoggerExtension,
    ConnectionManagerExtension,
    CommandExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
