/*
import { Kernel as ParentKernel } from './parents/Kernel';
import { EnvProvider } from './providers/EnvProvider';
import { ConfigProvider } from './providers/ConfigProvider';
import { CommandProvider } from './providers/CommandProvider';
import { CommandServiceProvider } from '../../cli/src/parents/CommandServiceProvider';
import { CallCommand } from '../../cli/src/commands/CallCommand';
import { ListCommand } from '../../cli/src/commands/ListCommand';

class BaseCommandServiceProvider extends CommandServiceProvider {
  commands = [
    CallCommand,
    ListCommand,
  ];
}

export class Kernel extends ParentKernel {
  readonly alias = [
    EnvProvider,
    ConfigProvider,
    CommandProvider,
  ];

  readonly serviceProviders = [
    BaseCommandServiceProvider,
  ];
}
*/