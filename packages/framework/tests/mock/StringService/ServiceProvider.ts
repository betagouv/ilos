import { Parents, Types, Interfaces, Extensions } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { CustomProvider } from '../Providers/CustomProvider';
 
export class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions = [
    class extends ConfigExtension {
      workingPath = __dirname;
    },
    class extends Extensions.Bindings {
      alias = [
        CustomProvider,
      ];
    }
  ]

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    HelloAction,
    ResultAction,
  ];

  async init() {
    super.init();
    this.getContainer().get(CustomProvider).set('string:');
  }
}
