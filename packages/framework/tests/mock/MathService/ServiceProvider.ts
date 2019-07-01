import { Parents, Types, Interfaces, Extensions } from '@ilos/core';

import { AddAction } from './actions/AddAction';
import { CustomProvider } from '../Providers/CustomProvider';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions = [
    class extends Extensions.Bindings {
      alias = [
        CustomProvider,
      ];
    }
  ]

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    AddAction,
  ];

  async init() {
    super.init();
    this.getContainer().get(CustomProvider).set('math:');
  }
}
