import 'reflect-metadata';
import {
  Container as InversifyContainer,
  ContainerModule as InversifyContainerModule,
  interfaces,
} from 'inversify';

import { Interfaces, Types } from '..';
import { HandlerConfig, ContainerInterface } from './ContainerInterfaces';
import { normalizeHandlerConfig } from './helpers/normalizeHandlerConfig';

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerConfig[] = [];
  parent: Container | null;

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
  protected setHandlerFinal(handlerConfig: HandlerConfig, resolvedHandler: any) {
    if (this.parent) {
      this.parent.setHandlerFinal(handlerConfig, resolvedHandler);
      return;
    }
    const normalizedHandlerConfig = normalizeHandlerConfig(handlerConfig);

    if (!normalizedHandlerConfig.containerSignature) {
      throw new Error('Oups');
    }
    this.handlersRegistry.push(normalizedHandlerConfig);
    this.bind<Interfaces.HandlerInterface>(normalizedHandlerConfig.containerSignature).toConstantValue(resolvedHandler);
  }


  /**
   * Set an handler
   * @param {Types.NewableType<Interfaces.HandlerInterface>} handler
   * @memberof Container
   */
  setHandler(handler: Types.NewableType<Interfaces.HandlerInterface>): Interfaces.HandlerInterface {
    const service = Reflect.getMetadata('rpc:service', handler);
    const method = Reflect.getMetadata('rpc:method', handler);
    const version = Reflect.getMetadata('rpc:version', handler);
    const local = Reflect.getMetadata('rpc:local', handler);
    const queue = Reflect.getMetadata('rpc:queue', handler);

    const handlerConfig = normalizeHandlerConfig({ service, method, version, local, queue });
    const resolvedHandler = this.get<Interfaces.HandlerInterface>(<any>handler);
    // TODO: throw error if not found
    // TODO: throw error if duplicate

    this.setHandlerFinal(handlerConfig, resolvedHandler);

    return resolvedHandler;
  }

  createChild(containerOptions: interfaces.ContainerOptions = {}): Container {
    const container = new Container(containerOptions);
    container.parent = this;
    return container;
  }
}

export class ContainerModule extends InversifyContainerModule {}
