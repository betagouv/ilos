import { Parents, Extensions, Interfaces, Container } from '@ilos/core';
import { Commands, CommandExtension } from '@ilos/cli';
import { ConfigExtension, ConfigInterfaceResolver } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { LoggerExtension } from '@ilos/logger';

@Container.kernel({
  config: process.cwd(),
  commands: [
    Commands.CallCommand,
    Commands.ListCommand,
    Commands.ScaffoldCommand,
  ],
})
export class Kernel extends Parents.Kernel {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    ConfigExtension,
    LoggerExtension,
    ConnectionManagerExtension,
    CommandExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
