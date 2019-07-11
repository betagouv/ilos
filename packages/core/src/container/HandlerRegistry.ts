import {
  NewableType,
  HandlerInterface,
  HandlerConfigType,
  ContainerInterface,
} from '@ilos/common';

import { normalizeHandlerConfig } from './helpers/normalizeHandlerConfig';
import { HANDLER_META } from './Metadata';

export class HandlerRegistry {
  static readonly key: symbol = Symbol.for('handlers');

  constructor(
    protected container: ContainerInterface,
  ) {
    //
  }

  /**
   * Get all registred handlers
   * @returns {HandlerConfigType[]}
   * @memberof Container
   */
  all(): (HandlerConfigType&{ resolver: Function })[] {
    try {
      return this.container.root.getAll(HandlerRegistry.key);
    } catch {
      return [];
    }
  }

  /**
   * Set an handler
   * @param {NewableType<HandlerInterface>} handler
   * @memberof Container
   */
  set(handler: NewableType<HandlerInterface>): void {
    const service = Reflect.getMetadata(HANDLER_META.SERVICE, handler);
    const method = Reflect.getMetadata(HANDLER_META.METHOD, handler);
    const version = Reflect.getMetadata(HANDLER_META.VERSION, handler);
    const local = Reflect.getMetadata(HANDLER_META.LOCAL, handler);
    const queue = Reflect.getMetadata(HANDLER_META.QUEUE, handler);

    const handlerConfig = normalizeHandlerConfig({ service, method, version, local, queue });

    this.container.bind(handler).toSelf();
    const resolver = () => this.container.get<HandlerInterface>(handler);

    this.container.root.bind(HandlerRegistry.key).toConstantValue({
      ...handlerConfig,
      resolver,
    });

    // TODO: throw error if not found
    // TODO: throw error if duplicate

    return;
  }

  /**
   * Get a particular handler
   * [local, sync] => [local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [local, async] => [local/async, local/async/*, local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [remote, sync] => [remote/sync, remote/sync/*]
   * [remote, async] => [remote/sync, remote/sync/*]
   * @param {HandlerConfigType} config
   * @returns {HandlerInterface}
   * @memberof Container
   */
  get(initialConfig: HandlerConfigType): HandlerInterface {
    const config = normalizeHandlerConfig(initialConfig);

    // local is true by default
    if (!('local' in config) || config.local === undefined) {
      config.local = true;
    }
    // remote/async is not possible now
    if ('local' in config
      && !config.local
      && 'queue' in config
      && config
    ) {
      config.queue = false;
    }

    const handlers = this.all().filter((hconfig) => {
      return (
        // same service
        config.service === hconfig.service
        // same method or *
        && (
          config.method === hconfig.method
          || hconfig.method === '*'
        )
        // local + remote or just remote if asked
        && (
          config.local
          || !hconfig.local
        )
        // async + sync or just sync if asked
        && (
          config.queue
          || !hconfig.queue
        )
      );
    }).sort((hconfig1, hconfig2) => {
      if (hconfig1.local !== hconfig2.local) {
        return (hconfig1.local === config.local) ? -1 : 1;
      }

      if (hconfig1.method !== hconfig2.method) {
        return (hconfig1.method === config.method) ? -1 : 1;
      }

      if (hconfig1.queue !== hconfig2.queue) {
        return (hconfig1.local === config.local) ? -1 : 1;
      }

      return 0;
    });

    return (handlers.length > 0) ? handlers.shift().resolver() : undefined;
  }
}
