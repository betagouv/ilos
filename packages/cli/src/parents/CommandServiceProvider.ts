import { Types, Interfaces, Parents } from '@ilos/core';
import { CommandProvider } from '../providers/CommandProvider';

export abstract class CommandServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  protected commander: CommandProvider;
  public readonly commands: Types.NewableType<Interfaces.CommandInterface>[];

  async boot() {
    await super.boot();
    this.commander = this.container.get<CommandProvider>(CommandProvider);

    for (const command of this.commands) {
      const cmd = this.container.get<Interfaces.CommandInterface>(command);
      this.registerCommand(cmd);
    }
  }

  registerCommand(cmd: Interfaces.CommandInterface): any {
    const command = this.commander.command(cmd.signature);

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
      const logger = this.container.get<CommandProvider>(CommandProvider).output;
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
