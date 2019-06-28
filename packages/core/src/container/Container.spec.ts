// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Types, Interfaces } from '..';
import { Container, handler, lib, provider, inject } from '.';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Container', () => {
  it('works', async () => {
    @lib()
    class Hello {
      public world = '!!';
    }

    @handler({
      service: 'test',
      method: 'hello',
    })
    class Test implements Interfaces.HandlerInterface {
      public readonly middlewares = [];
      constructor(public hello: Hello) {}
      boot() {
        //
      }
      async call(call: Types.CallType) {
        return;
      }
    }

    const container = new Container();
    const t = container.resolve(Test);
    expect(t.hello.world).to.equal('!!');

    container.setHandler(Test);

    const tbis = <Test>container.getHandler({
      service: 'test',
      method: 'hello',
    });
    expect(tbis.hello.world).to.equal('!!');
  });

  it('works with provider', async () => {
    @lib()
    class HelloLib {
      public world = 'yeah';
    }

    @provider()
    class Hello {
      public world = '!!';
      @inject(HelloLib) helloLib: HelloLib;

      boot(
      ) {
        this.world = this.helloLib.world;
      }
    }

    @handler({
      service: 'test',
      method: 'hello',
    })
    class Test implements Interfaces.HandlerInterface {
      public readonly middlewares = [];
      constructor(public hello: Hello) {}
      boot() {
        //
      }
      async call(call: Types.CallType) {
        return;
      }
    }

    const container = new Container();
    const t = container.resolve(Test);
    expect(t.hello.world).to.equal('yeah');

    container.setHandler(Test);

    const tbis = <Test>container.getHandler({
      service: 'test',
      method: 'hello',
    });
    expect(tbis.hello.world).to.equal('yeah');
  });

  it('works with no boot provider', async () => {
    @provider()
    class Hello {
      public world = 'yeah';
    }

    @handler({
      service: 'test',
      method: 'hello',
    })
    class Test implements Interfaces.HandlerInterface {
      public readonly middlewares = [];
      constructor(public hello: Hello) {}
      boot() {
        //
      }
      async call(call: Types.CallType) {
        return;
      }
    }

    const container = new Container();
    const t = container.resolve(Test);
    expect(t.hello.world).to.equal('yeah');

    container.setHandler(Test);

    const tbis = <Test>container.getHandler({
      service: 'test',
      method: 'hello',
    });
    expect(tbis.hello.world).to.equal('yeah');
  });
});
