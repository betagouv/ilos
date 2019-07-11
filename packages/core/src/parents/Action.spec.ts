// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  MiddlewareInterface,
  ResultType,
  ParamsType,
  ContextType,
} from '@ilos/common';

import { middleware } from '../container';
import { Action } from './Action';

import { ServiceContainer } from './ServiceContainer';

chai.use(chaiAsPromised);

const defaultContext = {
  channel: {
    service: '',
  },
};

@middleware()
class MinusMiddleware implements MiddlewareInterface {
  async process(params, context, next) {
    const result = await next(params, context);
    return result - 1;
  }
}

@middleware()
class HelloMiddleware implements MiddlewareInterface {
  async process(params, context, next) {
    const result = await next(params, context);
    return `hello ${result}?`;
  }
}

@middleware()
class WorldMiddleware implements MiddlewareInterface {
  async process(params, context, next) {
    const result = await next(params, context);
    return `world ${result}!`;
  }
}

describe('Action', () => {
  it('should work', async () => {
    class BasicAction extends Action {
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let count = 0;
        if ('add' in params) {
          const { add } = params;
          add.forEach((param) => {
            count += param;
          });
        }
        return count;
      }
    }
    const action = new BasicAction();
    const result = await action.call({
      result: 0,
      method: '',
      params: {
        add: [1, 1],
      },
      context: defaultContext,
    });
    expect(result).equal(2);
  });

  it('should work with middleware', async () => {
    class BasicAction extends Action {
      public readonly middlewares = ['minus'];
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let count = 0;
        if ('add' in params) {
          const { add } = params;
          add.forEach((param) => {
            count += param;
          });
        }
        return count;
      }
    }
    const action = new BasicAction();
    const container = new (class extends ServiceContainer {})();
    container.getContainer().bind('minus').to(MinusMiddleware);
    await action.init(container);
    const result = await action.call({
      result: 0,
      method: '',
      params: {
        add: [1, 1],
      },
      context: defaultContext,
    });
    expect(result).equal(1);
  });

  it('should work with ordered middleware', async () => {
    class BasicAction extends Action {
      public readonly middlewares = ['hello', 'world'];
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let result = '';
        if ('name' in params) {
          result = params.name;
        }
        return result;
      }
    }
    const action = new BasicAction();
    const container = new (class extends ServiceContainer {})();
    container.getContainer().bind('hello').to(HelloMiddleware);
    container.getContainer().bind('world').to(WorldMiddleware);
    await action.init(container);
    const result = await action.call({
      result: '',
      method: '',
      params: {
        name: 'Sam',
      },
      context: defaultContext,
    });
    expect(result).equal('hello world Sam!?');
  });

  it('should raise an error if no handle method is defined', () => {
    class BasicAction extends Action {}
    const action = new BasicAction();
    return (<any>expect(action.call({
      result: {},
      method: '',
      params: {
        params: {
          name: 'Sam',
        },
      },
      context: defaultContext,
    })).to).eventually
    .be.rejectedWith('No implementation found')
    .and.be.an.instanceOf(Error);
  });
});
