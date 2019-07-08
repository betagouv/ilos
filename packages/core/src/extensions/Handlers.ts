import { RegisterHookInterface } from '../interfaces/hooks/RegisterHookInterface';
import { NewableType } from '../types';
import { ServiceContainerInterface, HandlerInterface } from '../interfaces';

export class Handlers implements RegisterHookInterface {
  static readonly key = 'handlers';
  constructor(protected readonly handlers: NewableType<HandlerInterface>[]) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    for (const handler of this.handlers) {
      serviceContainer.getContainer().setHandler(handler);
      serviceContainer.registerHooks(handler.prototype, handler);
    }
  }
}
