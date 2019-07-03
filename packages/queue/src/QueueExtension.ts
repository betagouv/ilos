import { Interfaces, Types } from '@ilos/core';
import { EnvInterfaceResolver } from '@ilos/env';
import { queueHandlerFactory } from '@ilos/handler-redis';
import { QueueConfigType, QueueTargetType } from './QueueTypes';

export class QueueExtension {
  static readonly key: string = 'queue';
  protected isWorker = false;

  constructor(
    protected config: QueueConfigType | QueueTargetType[],
  ) {

  }

  register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (container.isBound(EnvInterfaceResolver)) {
      this.isWorker = container.get(EnvInterfaceResolver).get('APP_WORKER', false);
    }

    const targets = this.filterTargets(
      [...(Array.isArray(this.config) ? this.config : this.config.for)],
      serviceContainer,
    );
    
    this.registerQueue(targets, serviceContainer);
  }

  protected filterTargets(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface,
  ): QueueTargetType[] {
    const container = serviceContainer.getContainer();
    const registredHandlers = Array.from(
      new Set(
        container
          .getHandlers()
          .filter((cfg) => 'local' in cfg && cfg.local && ('queue' in cfg && !cfg.queue))
          .map((cfg) => cfg.service),
      ),
    );
    let registredQueues: QueueTargetType[] = [];
    if (container.isBound(Symbol.for('queues'))) {
      registredQueues = container.getAll<QueueTargetType>(Symbol.for('queues'));
    }

    return targets.filter((target) => {
      // if already registred, filter it
      if (registredQueues.indexOf(target) !== -1) {
        return false;
      }
      // if no native handler is present, filter it
      if (registredHandlers.indexOf(target) < 0) {
        return false;
      }
      return true;
    });
  }

  protected registerQueue(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface
  ) {
    for(const target of targets) {
      serviceContainer.getContainer().bind(Symbol.for('queues')).toConstantValue(target);
    }
    if (!this.isWorker) {
      this.registerQueueHandlers(targets, serviceContainer);
    }
  }

  protected registerQueueHandlers(
    targets: QueueTargetType[],
    serviceContainer: Interfaces.ServiceContainerInterface
  ) {
    for(const target of targets) {
      const handler: Types.NewableType<Interfaces.HandlerInterface> = queueHandlerFactory(target);
      const handlerInstance = serviceContainer.getContainer().setHandler(handler);
      serviceContainer.registerHooks(handlerInstance);
    }
  }
}