import { Kernel as BaseKernel, Extensions } from '@ilos/core';
import { Commands, CommandExtension } from '@ilos/cli';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { LoggerExtension } from '@ilos/logger';
import { QueueExtension } from '@ilos/queue';
import { NotificationExtension } from '@ilos/notification';
import { TemplateExtension } from '@ilos/template';
import { ValidatorExtension } from '@ilos/validator';
import { kernel } from '@ilos/common';

@kernel({
  config: process.cwd(),
  commands: [Commands.CallCommand, Commands.ListCommand, Commands.ScaffoldCommand],
})
export class Kernel extends BaseKernel {
  readonly extensions = [
    EnvExtension,
    ConfigExtension,
    LoggerExtension,
    ConnectionManagerExtension,
    CommandExtension,
    NotificationExtension,
    TemplateExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
    QueueExtension,
  ];
}
