import { HandlerInterface } from '../interfaces/HandlerInterface';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';
import { ServiceContainer } from './ServiceContainer';

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider extends ServiceContainer implements ServiceProviderInterface {
  readonly handlers: NewableType<HandlerInterface>[] = [];
  protected handlerRegistry: Set<HandlerInterface> = new Set();

  async register() {
    await super.register();
    for (const handler of this.handlers) {
      const handlerInstance = this.getContainer().setHandler(handler);
      this.handlerRegistry.add(handlerInstance);
    }
  }

  async init() {
    await super.init();
    for (const [handler] of this.handlerRegistry.entries()) {
      await handler.boot(this.getContainer());
    }
    this.handlerRegistry.clear();
  }
}
