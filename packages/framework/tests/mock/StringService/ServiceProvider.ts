import { Parents } from '@ilos/core';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';

export class ServiceProvider extends Parents.ServiceProvider {
  handlers = [
    HelloAction,
    ResultAction,
  ];
}
