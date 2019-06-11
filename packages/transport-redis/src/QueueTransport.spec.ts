// tslint:disable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import { handler } from '@ilos/container';
import { Types, Interfaces, Parents } from '@ilos/core';

import * as Bull from './helpers/bullFactory';
import { QueueTransport } from './QueueTransport';

const sandbox = sinon.createSandbox();

@handler({
  service: 'math',
  method: 'minus',
})
class BasicAction extends Parents.Action {
  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    let count = 0;
    if ('minus' in params) {
      const { add } = params;
      add.forEach((param) => {
        count -= param;
      });
    } else {
      throw new Error('Please provide add param');
    }
    return count;
  }
}

@handler({
  service: 'math',
  method: 'add',
})
class BasicTwoAction extends Parents.Action {
  protected async handle(params: Types.ParamsType, context: Types.ContextType):Promise<Types.ResultType> {
    let count = 0;
    if ('add' in params) {
      const { add } = params;
      add.forEach((param) => {
        count += param;
      });
    } else {
      throw new Error('Please provide add param');
    }
    return count;
  }
}

class BasicServiceProvider extends ServiceProvider {
  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [BasicAction, BasicTwoAction];
}

class BasicKernel extends Kernel {
  serviceProviders = [BasicServiceProvider];
}


describe('Queue transport', () => {
  beforeEach(() => {
    sandbox.stub(Bull, 'bullFactory').callsFake(
      // @ts-ignore
      name => ({
        name,
        async process(fn) { this.fn = fn; return; },
        async close() { return; },
        async isReady() { return this; },
        on(event: string, callback: (...args: any[]) => void) { return this; },
        async add(call) {
          const fn = this.fn;
          return fn(call);
        },
      }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('works', async () => {
    const kernel = new BasicKernel();
    await kernel.boot();
    const queueTransport = new QueueTransport(kernel);
    await queueTransport.up(['redis://localhost', 'prod']);
    expect(queueTransport.queues.length).to.equal(1);
    expect(queueTransport.queues[0].name).to.equal('prod-math');
    const response = await queueTransport.queues[0].add({
      data: {
        id: null,
        jsonrpc: '2.0',
        method: 'math@latest:add',
        params: {
          params: {
            add: [1, 2],
          },
          _context: {
            transport: 'http',
            user: 'me',
            internal: false,
          },
        },
      },
    });
    expect(response).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      result: 3,
    });
    await queueTransport.down();
  });
});

