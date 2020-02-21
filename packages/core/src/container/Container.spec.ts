// tslint:disable max-classes-per-file
import test from 'ava';
import { HandlerInterface, CallType, handler, lib, provider, inject } from '@ilos/common';

import { Container } from '.';

test('Container: works', async (t) => {
  @lib()
  class Hello {
    public world = '!!';
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call(call: CallType) {
      return;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  t.is(h.hello.world, '!!');
  
  container.setHandler(Test);

  const hBis = container.getHandler({
    service: 'test',
    method: 'hello',
  }) as Test;
  t.is(hBis.hello.world, '!!');
});

test('Container: works with provider', async (t) => {
  @lib()
  class HelloLib {
    public world = 'yeah';
  }

  @provider()
  class Hello {
    public world = '!!';
    @inject(HelloLib) helloLib: HelloLib;

    boot() {
      this.world = this.helloLib.world;
    }
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call(call: CallType) {
      return;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  t.is(h.hello.world, 'yeah');

  container.setHandler(Test);
  const hbis = container.getHandler({
    service: 'test',
    method: 'hello',
  }) as Test;
  t.is(hbis.hello.world, 'yeah');
});
test('Container: works with no boot provider', async (t) => {
  @provider()
  class Hello {
    public world = 'yeah';
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call(call: CallType) {
      return;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  t.is(h.hello.world, 'yeah');

  container.setHandler(Test);

  const hbis = container.getHandler({
    service: 'test',
    method: 'hello',
  }) as Test;
  t.is(hbis.hello.world, 'yeah');
});
