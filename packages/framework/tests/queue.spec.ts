// tslint:disable max-classes-per-file
import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';

import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';

import { TransportInterface, KernelInterface, serviceProvider, kernel as kernelDecorator, handler } from '@ilos/common';

import { Kernel } from '../src/Kernel';
import { ServiceProvider as ParentStringServiceProvider } from './mock/StringService/ServiceProvider';

// process.env.APP_REDIS_URL = 'redis://127.0.0.1:6379';

const logPath = path.join(os.tmpdir(), 'ilos-test-' + new Date().getTime());
process.env.APP_LOG_PATH = logPath;

const redisUrl = process.env.APP_REDIS_URL;

@serviceProvider({
  config: {
    redis: {
      connectionString: process.env.APP_REDIS_URL,
      connectionOptions: {},
    },
    log: {
      path: process.env.APP_LOG_PATH,
    },
  },
})
class StringServiceProvider extends ParentStringServiceProvider {}

@kernelDecorator({
  children: [StringServiceProvider],
})
class StringKernel extends Kernel {
  name = 'string';
}

function makeRPCNotify(port: number, req: { method: string; params?: any }) {
  const data = {
    jsonrpc: '2.0',
    method: req.method,
    params: req.params,
  };

  return axios.post(`http://127.0.0.1:${port}`, data, {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
  });
}

let stringTransport: TransportInterface;
let queueTransport: TransportInterface;
let stringCallerKernel: KernelInterface;
let stringCalleeKernel: KernelInterface;

describe('Queue integration', () => {
  before(async () => {
    stringCallerKernel = new StringKernel();
    await stringCallerKernel.bootstrap();
    stringTransport = new HttpTransport(stringCallerKernel);
    await stringTransport.up(['8081']);

    stringCalleeKernel = new StringKernel();
    await stringCalleeKernel.bootstrap();
    queueTransport = new QueueTransport(stringCalleeKernel);
    await queueTransport.up([redisUrl]);
  });

  after(async () => {
    await stringTransport.down();
    await queueTransport.down();
    await stringCalleeKernel.shutdown();
    await stringCallerKernel.shutdown();
  });

  it('should works', (done) => {
    const data = { name: 'sam' };
    makeRPCNotify(8081, { method: 'string:log', params: data })
      .then((responseString) => {
        expect(responseString.data).to.equal('');
        setTimeout(() => {
          const content = fs.readFileSync(logPath, { encoding: 'utf8', flag: 'r' });
          expect(content).to.eq(JSON.stringify(data));
          done();
        }, 1000);
      })
      .catch((e) => {
        done(e);
      });
  });
});

// // tslint:disable max-classes-per-file
// import { expect } from 'chai';

// import { Kernel, Actions, Container, Extensions } from '@ilos/core';
// import { ConfigExtension } from '@ilos/config';
// import { RedisConnection } from '@ilos/connection-redis';

// import { ConnectionManagerExtension } from '@ilos/connection-manager';
// import { QueueExtension } from '@ilos/queue';
// import { QueueTransport } from '@ilos/transport-redis';
// import { EnvExtension } from '@ilos/env';

// const config = {
//   redis: {
//     connectionString: process.env.APP_REDIS_URL,
//     connectionOptions: {},
//   },
// };

// function createKernel(done, testParams) {
//   handler({
//     service: 'hello',
//     method: 'world',
//   })
//   class HelloWorldAction extends Action {
//     constructor(
//       protected kernel: KernelInterfaceResolver,
//     ) {
//       super();
//     }
//     protected async handle(params):Promise<void> {
//       this.kernel.notify('hello:asyncWorld', params, {
//         channel: {
//           service: 'hello',
//         },
//       });
//     }
//   }

//   handler({
//     service: 'hello',
//     method: 'asyncWorld',
//   })
//   class HelloAsyncWorldAction extends Action {
//     protected async handle(params):Promise<void> {
//       expect(params).to.deep.eq(testParams);
//       done();
//       return;
//     }
//   }

//   kernel({
//     config,
//     env: null,
//     connections: [
//       [RedisConnection, 'redis'],
//     ],
//     handlers: [
//       HelloWorldAction,
//       HelloAsyncWorldAction,
//     ],
//     queues: ['hello'],
//   })
//   class Kernel extends Kernel {
//     extensions = [
//       EnvExtension,
//       ConfigExtension,
//       Extensions.Providers,
//       ConnectionManagerExtension,
//       Extensions.Handlers,
//       QueueExtension,
//     ];
//   }
//   return Kernel;
// }

// async function bootKernel(kernelConstructor) {
//   const callerKernel = new kernelConstructor();
//   const calleeKernel = new kernelConstructor();
//   await callerKernel.bootstrap();
//   await calleeKernel.bootstrap();
//   const redis = new QueueTransport(calleeKernel);
//   await redis.up();

//   return callerKernel;
// }

// describe('Queue extension', () => {
//   it('should work', (done) => {
//     const testParams = {
//       message: 'it works',
//     };
//     const kernelConstructor = createKernel(done, testParams);
//     bootKernel(kernelConstructor)
//       .then((kernel) => {
//         kernel.call('hello:world', testParams, { channel: { service: 'test' } });
//       });
//   });
// });
