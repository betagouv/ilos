import { Parents } from '@ilos/core';

import { AddAction } from './actions/AddAction';

export class ServiceProvider extends Parents.ServiceProvider {
  handlers = [
    AddAction,
  ];
}
