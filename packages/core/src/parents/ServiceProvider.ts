import {
  ContainerModuleConfigurator,
} from '../container';

import { HandlerInterface } from '../interfaces/HandlerInterface';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
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
  readonly middlewares: [string, NewableType<MiddlewareInterface>][] = [];

  public async boot() {
    await super.boot();

    for (const handler of this.handlers) {
      const handlerInstance = this.getContainer().setHandler(handler);
      await handlerInstance.boot(this.getContainer());
    }
  }

  public register(module: ContainerModuleConfigurator):void {
    super.register(module);
    this.middlewares.forEach(([name, middleware]) => {
      module.bind(name).to(middleware);
    });
  }
}
