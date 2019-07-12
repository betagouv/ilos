import {
  NewableType,
  ServiceContainerInterface,
  InitHookInterface,
  RegisterHookInterface,
  CommandInterface,
  extension,
} from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';

@extension({
  name: 'commands',
})
export class CommandExtension implements RegisterHookInterface, InitHookInterface {
  constructor(
    readonly commands: NewableType<CommandInterface>[],
  ) {
    //
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (!container.isBound(CommandRegistry)) {
      container.bind(CommandRegistry).toSelf();
    }

    for (const command of this.commands) {
      container.bind(command).toSelf();
    }
  }

  async init(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const commandRegistry = container.get<CommandRegistry>(CommandRegistry);

    for (const command of this.commands) {
      const cmd = container.get(command);
      this.registerCommand(commandRegistry, cmd);
    }
  }

  protected registerCommand(registry: CommandRegistry, cmd: CommandInterface): any {
    const command = registry.command(cmd.signature);

    command.description(cmd.description);

    for (const option of cmd.options) {
      const { signature, description, coerce, default: def } = option;
      const args = [];
      if (typeof coerce === 'function') {
        args.push(coerce);
      }
      if (typeof def !== 'undefined') { //tslint:disable-line
        args.push(def);
      }
      command.option(signature, description, ...args);
    }

    command.action(async (...args: any[]) => {
      const logger = registry.output;
      try {
        const result = await cmd.call(...args);
        logger(result);
      } catch (e) {
        logger(e);
      }
    });

    return command;
  }
}
