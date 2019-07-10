import 'reflect-metadata';
import {
  Container as InversifyContainer,
  ContainerModule as InversifyContainerModule,
  interfaces,
} from 'inversify';

import { Interfaces, Types } from '..';
import { HandlerConfig, ContainerInterface } from './ContainerInterfaces';
import { normalizeHandlerConfig } from './helpers/normalizeHandlerConfig';
import { HANDLER_META } from './Metadata';

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerConfig[] = [];
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

  /**
   * Get all registred handlers
   * @returns {HandlerConfig[]}
   * @memberof Container
   */
  getHandlers(): HandlerConfig[] {
    return [...this.handlersRegistry];
  }


  /**
   * Get a particular handler
   * [local, sync] => [local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [local, async] => [local/async, local/async/*, local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [remote, sync] => [remote/sync, remote/sync/*]
   * [remote, async] => [remote/sync, remote/sync/*]
   * @param {HandlerConfig} config
   * @returns {Interfaces.HandlerInterface}
   * @memberof Container
   */
  getHandler(config: HandlerConfig): Interfaces.HandlerInterface {
    const normalizedHandlerConfig = normalizeHandlerConfig(config);

    // local is true by default
    if (!('local' in normalizedHandlerConfig) || normalizedHandlerConfig.local === undefined) {
      normalizedHandlerConfig.local = true;
    }

    // remote/async is not possible now
    if ('local' in normalizedHandlerConfig
      && !normalizedHandlerConfig.local
      && 'queue' in normalizedHandlerConfig
      && normalizedHandlerConfig
    ) {
      normalizedHandlerConfig.queue = false;
    }

    let result: Interfaces.HandlerInterface | undefined;

    // 1. Try to get service:method
    result = this.getHandlerFinal(normalizedHandlerConfig);
    if (result) {
      return result;
    }

    // 2. Try to get service:*
    result = this.getHandlerFinal({
      ...normalizedHandlerConfig,
      method: '*',
    });
    if (result) {
      return result;
    }

    /*
      Try with a new configuration :
      - if the config is local and not a queue > try remote
      - if the config is queue > try sync
    */

    if (normalizedHandlerConfig.local
      && (!('queue' in normalizedHandlerConfig) || !normalizedHandlerConfig.queue)
    ) {
      // 3. Try to get remote call
      return this.getHandler({
        ...normalizedHandlerConfig,
        local: false,
      });
    }

    if (normalizedHandlerConfig.queue) {
      // 3bis. Try to get sync call
      return this.getHandler({
        ...normalizedHandlerConfig,
        queue: false,
      });
    }

    return;
  }

  /**
   * Get a particular handler or undefined if not known
   * @protected
   * @param {HandlerConfig} config
   * @returns {(Interfaces.HandlerInterface | undefined)}
   * @memberof Container
   */
  protected getHandlerFinal(config: HandlerConfig): Interfaces.HandlerInterface | undefined {
    const { containerSignature } = normalizeHandlerConfig(config);
    if (!containerSignature) {
      throw new Error('Oups');
    }

    if (this.isBound(containerSignature)) {
      return this.get(containerSignature);
    }
    return;
  }


  /**
   * Set an handler identified by config
   * @protected
   * @param {HandlerConfig} handlerConfig
   * @param {*} resolvedHandler
   * @returns
   * @memberof Container
   */
  protected setHandlerFinal(handlerConfig: HandlerConfig, handlerResolver: () => Interfaces.HandlerInterface) {
    const container = this.root;
    const normalizedHandlerConfig = normalizeHandlerConfig(handlerConfig);

    if (!normalizedHandlerConfig.containerSignature) {
      throw new Error('Oups');
    }
    container.handlersRegistry.push(normalizedHandlerConfig);
    container.bind<Interfaces.HandlerInterface>(normalizedHandlerConfig.containerSignature).toDynamicValue(handlerResolver);
  }

  /**
   * Set an handler
   * @param {Types.NewableType<Interfaces.HandlerInterface>} handler
   * @memberof Container
   */
  setHandler(handler: Types.NewableType<Interfaces.HandlerInterface>): void {
    const service = Reflect.getMetadata(HANDLER_META.SERVICE, handler);
    const method = Reflect.getMetadata(HANDLER_META.METHOD, handler);
    const version = Reflect.getMetadata(HANDLER_META.VERSION, handler);
    const local = Reflect.getMetadata(HANDLER_META.LOCAL, handler);
    const queue = Reflect.getMetadata(HANDLER_META.QUEUE, handler);

    const handlerConfig = normalizeHandlerConfig({ service, method, version, local, queue });

    this.bind(handler).toSelf();
    const handlerResolver = () => this.get<Interfaces.HandlerInterface>(handler);

    // TODO: throw error if not found
    // TODO: throw error if duplicate

    this.setHandlerFinal(handlerConfig, handlerResolver);

    return;
  }

  createChild(containerOptions: interfaces.ContainerOptions = {}): Container {
    const container = new Container(containerOptions);
    container.parent = this;
    return container;
  }
}

export class ContainerModule extends InversifyContainerModule {}
