import { Types, Interfaces, Container } from '@ilos/core';
import { CommandRegistry } from '../providers/CommandRegistry';
import { CommandInterface } from '../interfaces';

export class CommandExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  readonly commands: Types.NewableType<CommandInterface>[] = [];

  constructor(
    readonly container: Container.ContainerInterface,
  ) {
    //
  }

  async register() {
    if (!this.container.isBound(CommandRegistry)) {
      this.container.bind(CommandRegistry).toSelf();
    }

    for(const command of this.commands) {
      this.container.bind(command).toSelf();
    }
  }

  async init() {
    const commandRegistry = this.container.get<CommandRegistry>(CommandRegistry);

    for (const command of this.commands) {
      const cmd = this.container.get(command);
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
