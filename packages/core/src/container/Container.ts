import 'reflect-metadata';
import {
  Container as InversifyContainer,
  ContainerModule as InversifyContainerModule,
  interfaces,
} from 'inversify';

import {
  HandlerInterface,
  NewableType,
  HandlerConfigType,
  ContainerInterface,
} from '@ilos/common';
import { HandlerRegistry } from './HandlerRegistry';

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerRegistry = new HandlerRegistry(this);
  parent: Container | null;

  get root(): Container {
    if (this.parent) {
      return this.parent.root;
    }
    return this;
  }

  /**
   * Creates an instance of Container.
   * @param {interfaces.ContainerOptions} [containerOptions]
   * @memberof Container
   */
  constructor(containerOptions?: interfaces.ContainerOptions) {
    super({
      defaultScope: 'Singleton',
      autoBindInjectable: true,
      skipBaseClassChecks: true,
      ...containerOptions,
    });
  }

  createChild(containerOptions: interfaces.ContainerOptions = {}): Container {
    const container = new Container(containerOptions);
    container.parent = this;
    return container;
  }

  setHandler(handler: NewableType<HandlerInterface>) {
    return this.handlersRegistry.set(handler);
  }

  getHandler(config: HandlerConfigType): HandlerInterface {
    return this.handlersRegistry.get(config);
  }

  getHandlers(): HandlerConfigType[] {
    return this.handlersRegistry.all();
  }
}

export class ContainerModule extends InversifyContainerModule {}
