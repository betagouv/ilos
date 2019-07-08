// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { handler, provider, serviceProvider } from '../container';
import { HandlerInterface } from '../interfaces/HandlerInterface';
import { NewableType } from '../types/NewableType';
import { ProviderInterface } from '../interfaces/ProviderInterface';
import { ServiceProvider as ParentServiceProvider} from './ServiceProvider';
import { Action } from './Action';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';

chai.use(chaiAsPromised);

const { expect, assert } = chai;
const defaultContext = { channel: { service: '' } };

describe('ServiceProvider', () => {
  it('should register handler', async () => {
    @handler({
      service: 'test',
      method: 'add',
    })
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
    @serviceProvider({
      handlers: [BasicAction],
    })
    class BasicServiceProvider extends ParentServiceProvider {}

    const sp = new BasicServiceProvider();
    await sp.register();
    await sp.init();

    const container = sp.getContainer();
    expect(container.getHandler({ service: 'test', method: 'add' })).be.instanceOf(BasicAction);
  });

  it('should register handler with extension', async () => {
    abstract class TestResolver {
      hello(name) {
        throw new Error();
      }
    }

    @provider()
    class Test implements ProviderInterface {
      base: string;
      boot() {
        this.base = 'Hello';
      }
      hello(name) {
        return `${this.base} ${name}`;
      }
    }

    @handler({
      service: 'test',
      method: 'hi',
    })
    class BasicAction extends Action {
      constructor(private test: TestResolver) {
        super();
      }
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        if ('name' in params) {
          return this.test.hello(params.name);
        }
        throw new Error('Missing arguments');
      }
    }

    @serviceProvider({
      providers: [
        [TestResolver, Test],
      ],
      handlers: [
        BasicAction,
      ],
    })
    class BasicServiceProvider extends ParentServiceProvider {}

    const sp = new BasicServiceProvider();
    await sp.register();
    await sp.init();

    const container = sp.getContainer();
    const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
    const response = await handlerInstance.call({ method: 'fake', params: { name: 'Sam' }, context: defaultContext });
    expect(response).be.equal('Hello Sam');
  });

  it('should register handler with alias and nested service providers', async () => {
    abstract class TestResolver {
      hello(name) {
        throw new Error();
      }
    }

    @provider({
      identifier: TestResolver,
    })
    class Test implements ProviderInterface {
      base: string;
      boot() {
        this.base = 'Hello';
      }
      hello(name) {
        const response = `${this.base} ${name}`;
        this.base = 'Hi';
        return response;
      }
    }

    @handler({
      service: 'test',
      method: 'hi',
    })
    class BasicAction extends Action {
      constructor(private test: TestResolver) {
        super();
      }
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        if ('name' in params) {
          return this.test.hello(params.name);
        }
        throw new Error('Missing arguments');
      }
    }

    @handler({
      service: 'test',
      method: 'add',
    })
    class BasicTwoAction extends Action {
      constructor(private test: TestResolver) {
        super();
      }
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let count = 0;
        if ('add' in params) {
          const { add } = params;
          add.forEach((param) => {
            count += param;
          });
        }
        return this.test.hello(count);
      }
    }

    @serviceProvider({
      providers: [Test],
      handlers: [BasicTwoAction],
    })
    class BasicTwoServiceProvider extends ParentServiceProvider {}

    @serviceProvider({
      providers: [Test],
      children: [
        BasicTwoServiceProvider,
      ],
      handlers: [BasicAction],
    })
    class BasicServiceProvider extends ParentServiceProvider {
    }

    const sp = new BasicServiceProvider();
    await sp.register();
    await sp.init();

    const container = sp.getContainer();
    const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
    const response = await handlerInstance.call({ method: 'fake', params: { name: 'Sam' }, context: defaultContext });
    expect(response).be.equal('Hello Sam');

    const handlerTwoInstance = container.getHandler({ service: 'test', method: 'add' });
    const responseTwo = await handlerTwoInstance.call({ method: 'fake', params: { add: [21, 21] }, context: defaultContext });
    expect(responseTwo).be.equal('Hello 42');

    const responseTwoBis = await handlerTwoInstance.call({ method: 'fake', params: { add: [21, 21] }, context: defaultContext });
    expect(responseTwoBis).be.equal('Hi 42');
  });
});
