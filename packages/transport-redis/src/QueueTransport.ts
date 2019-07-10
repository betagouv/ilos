import { Queue } from 'bull';

import { Container, Interfaces } from '@ilos/core';
import { QueueExtension } from '@ilos/queue';

import { bullFactory } from './helpers/bullFactory';

/**
 * Queue Transport
 * @export
 * @class QueueTransport
 * @implements {TransportInterface}
 */
export class QueueTransport implements Interfaces.TransportInterface {
  queues: Queue[] = [];
  kernel: Interfaces.KernelInterface;

  constructor(kernel: Interfaces.KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): Interfaces.KernelInterface {
    return this.kernel;
  }

  getInstance(): Queue[] {
    return this.queues;
  }

  async up(opts: string[] = []) {
    const [redisUrl] = opts;
    // throw error

    const container = <Container.ContainerInterface>this.kernel.getContainer();

    if (!container.isBound(QueueExtension.containerKey)) {
      throw new Error('No queue declared');
    }

    const services = container.getAll<string>(QueueExtension.containerKey);
    for (const service of services) {
      const key = service;
      // TODO : add Sentry error handler
      // TODO : add named job
      const queue = bullFactory(key, redisUrl);
      await queue.isReady();

      this.registerListeners(queue, key);
      this.queues.push(queue);
      queue.process(async job =>
        this.kernel.handle({
          jsonrpc: '2.0',
          id: 1,
          method: job.data.method,
          params: {
            params: job.data.params.params,
            _context: {
              ...job.data.params._context,
              channel: {
                transport: 'queue',
              },
            },
          },
        }),
      );
    }
  }

  async down() {
    const promises = [];
    for (const queue of this.queues) {
      promises.push(queue.close());
    }
    await Promise.all(promises);
  }

  protected registerListeners(queue: Queue, name: string, errorHandler?: Function): void {
    queue.on('error', (err) => {
      console.log(`🐮/${name}: error`, err.message);
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });

    queue.on('waiting', (jobId) => {
      console.log(`🐮/${name}: waiting ${jobId}`);
    });

    queue.on('active', (job) => {
      console.log(`🐮/${name}: active ${job.id} ${job.data.type}`);
    });

    queue.on('stalled', (job) => {
      console.log(`🐮/${name}: stalled ${job.id} ${job.data.type}`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`🐮/${name}: progress ${job.id} ${job.data.type} : ${progress}`);
    });

    queue.on('completed', (job) => {
      console.log(`🐮/${name}: completed ${job.id} ${job.data.type}`);
      job.remove();
    });

    queue.on('failed', (job, err) => {
      console.log(`🐮/${name}: failed ${job.id} ${job.data.type}`, err.message);
      console.log(job, err);
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });
  }
}
