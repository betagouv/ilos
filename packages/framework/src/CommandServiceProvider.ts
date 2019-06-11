import { Parents, Commands } from '@ilos/cli';

export class CommandServiceProvider extends Parents.CommandServiceProvider {
  commands = [
    Commands.CallCommand,
    Commands.ListCommand,
  ];
}
