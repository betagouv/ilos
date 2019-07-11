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

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerConfigType[] = [];
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
    return;
  }

  getHandler(config: HandlerConfigType): HandlerInterface {
    throw new Error();
  }

  getHandlers(): HandlerConfigType[] {
    throw new Error();
  }
}

export class ContainerModule extends InversifyContainerModule {}
