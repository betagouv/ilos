// tslint:disable no-shadowed-variable max-classes-per-file
import test from 'ava';
import { MiddlewareInterface, ResultType, ParamsType, ContextType, middleware } from '@ilos/common';

import { Action } from './Action';
import { ServiceContainer } from './ServiceContainer';

function setup() {
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

  return {
    defaultContext,
    MinusMiddleware,
    HelloMiddleware,
    WorldMiddleware,
  };
}

test('Action: works', async (t) => {
  const { defaultContext } = setup();
  class BasicAction extends Action {
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
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
  t.is(result, 2);
});

test('Action: should work with middleware', async (t) => {
  const { defaultContext, MinusMiddleware } = setup();

  class BasicAction extends Action {
    public readonly middlewares = ['minus'];
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
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
  container
    .getContainer()
    .bind('minus')
    .to(MinusMiddleware);
  await action.init(container);
  const result = await action.call({
    result: 0,
    method: '',
    params: {
      add: [1, 1],
    },
    context: defaultContext,
  });

  t.is(result, 1);
});

test('Action: should work with ordered middleware', async (t) => {
  const { defaultContext, HelloMiddleware, WorldMiddleware } = setup();
  class BasicAction extends Action {
    public readonly middlewares = ['hello', 'world'];
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let result = '';
      if ('name' in params) {
        result = params.name;
      }
      return result;
    }
  }
  const action = new BasicAction();
  const container = new (class extends ServiceContainer {})();
  container
    .getContainer()
    .bind('hello')
    .to(HelloMiddleware);
  container
    .getContainer()
    .bind('world')
    .to(WorldMiddleware);
  await action.init(container);
  const result = await action.call({
    result: '',
    method: '',
    params: {
      name: 'Sam',
    },
    context: defaultContext,
  });
  t.is(result, 'hello world Sam!?');
});

test('should raise an error if no handle method is defined', async (t) => {
  const { defaultContext } = setup();
  class BasicAction extends Action {}
  const action = new BasicAction();
  const err = await t.throwsAsync(() =>
    action.call({
      result: {},
      method: '',
      params: {
        params: {
          name: 'Sam',
        },
      },
      context: defaultContext,
    }),
  );
  t.true(err instanceof Error);
  t.is(err.message, 'No implementation found');
});
