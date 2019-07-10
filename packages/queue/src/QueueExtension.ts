import { Interfaces, Types } from '@ilos/core';
import { EnvInterfaceResolver } from '@ilos/env';
import { queueHandlerFactory } from '@ilos/handler-redis';

import { QueueConfigType, QueueTargetType } from './QueueTypes';

export class QueueExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  static readonly key: string = 'queues';

  static get containerKey() {
    return Symbol.for('queues');
  }

  protected isWorker = false;

  constructor(
    protected config: QueueConfigType | QueueTargetType[],
  ) {

  }

  register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const targets = this.filterTargets(
      [...(Array.isArray(this.config) ? this.config : this.config.for)],
      serviceContainer,
    );

    this.registerQueue(targets, serviceContainer);
  }

  async init(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (container.isBound(EnvInterfaceResolver)) {
      this.isWorker = container.get(EnvInterfaceResolver).get('APP_WORKER', false);
    }

    if (this.isWorker) {
      this.isProcessable(serviceContainer);
    }
  }

  protected isProcessable(
    serviceContainer: Interfaces.ServiceContainerInterface,
  ) {
    const rootContainer = serviceContainer.getContainer().root;
    const registredHandlers = Array.from(
      new Set(
        rootContainer
          .getHandlers()
          .filter(cfg => 'local' in cfg && cfg.local && ('queue' in cfg && !cfg.queue))
          .map(cfg => cfg.service),
      ),
    );
    const targets = rootContainer.getAll<string>(QueueExtension.containerKey);
    const unprocessableTargets = targets.filter(
      (service: string) => (registredHandlers.indexOf(service) < 0),
    );

    if (unprocessableTargets.length > 0) {
      throw new Error(`Unprocessable queue listeners: ${unprocessableTargets.join(', ')}`);
    }
  }

  protected filterTargets(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface,
  ): QueueTargetType[] {
    const rootContainer = serviceContainer.getContainer().root;

    let registredQueues: QueueTargetType[] = [];
    if (rootContainer.isBound(QueueExtension.containerKey)) {
      registredQueues = rootContainer.getAll<QueueTargetType>(QueueExtension.containerKey);
    }
    return targets.filter((target) => {
      // if already registred, filter it
      if (registredQueues.indexOf(target) !== -1) {
        return false;
      }
      return true;
    });
  }

  protected registerQueue(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface,
  ) {
    for (const target of targets) {
      serviceContainer
        .getContainer()
        .root
        .bind(QueueExtension.containerKey)
        .toConstantValue(target);
    }
    this.registerQueueHandlers(targets, serviceContainer);
  }

  protected registerQueueHandlers(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface,
  ) {
    for (const target of targets) {
      const handler: Types.NewableType<Interfaces.HandlerInterface> = queueHandlerFactory(target);
      serviceContainer.getContainer().setHandler(handler);
      serviceContainer.registerHooks(handler.prototype, handler);
    }
  }
}
