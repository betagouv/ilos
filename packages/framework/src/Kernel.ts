import { Parents, Extensions, Interfaces } from '@ilos/core';
import { Env, EnvInterfaceResolver } from '@ilos/env';
import { Config, ConfigInterfaceResolver } from '@ilos/config';
import { Commands, CommandExtension } from '@ilos/cli';

export class Kernel extends Parents.Kernel {
  readonly extensions: Interfaces.ServiceContainerConstructorInterface[] = [
    class extends Extensions.Bindings {
      readonly alias = [
        [EnvInterfaceResolver, Env],
        [ConfigInterfaceResolver, Config],
      ];    
    },
    class extends CommandExtension {
      commands = [
        Commands.CallCommand,
        Commands.ListCommand,
        Commands.ScaffoldCommand,
      ];
    },
  ];
}

