// tslint:disable no-invalid-this
import { describe } from 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import * as Bull from './helpers/bullFactory';
import { queueHandlerFactory } from './QueueHandler';

chai.use(chaiAsPromised);

const { expect, assert } = chai;

class FakeEnvProvider extends EnvProviderInterfaceResolver {
  boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return 'prod';
  }
}

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    return 'redis://localhost';
  }
}
const envProvider = new FakeEnvProvider();
const configProvider = new FakeConfigProvider(envProvider);

const sandbox = sinon.createSandbox();

const defaultContext = {
  channel: {
    service: '',
  },
};

describe('Queue handler', () => {
  beforeEach(() => {
    sandbox.stub(Bull, 'bullFactory').callsFake(
      // @ts-ignore
      () => ({
      // @ts-ignore
        async add(name, opts) {
          if (name !== 'nope') {
            return {
              name,
              opts,
            };
          }
          throw new Error('Nope');
        },
        async isReady() {
          return this;
        },
      }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('works', async () => {
    const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(envProvider, configProvider);
    queueProvider.boot();
    const result = await queueProvider.call({
      method: 'basic@latest:method',
      params: { add: [1, 2] },
      context: defaultContext,
    });
    expect(result).to.deep.equal({
      name: 'basic@latest:method',
      opts: {
        jsonrpc: '2.0',
        id: null,
        method: 'basic@latest:method',
        params: { params: { add: [1, 2] }, _context: defaultContext } },
    });
  });
  it('raise error if fail', async () => {
    const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(envProvider, configProvider);
    queueProvider.boot();
    return (<any>assert).isRejected(
      queueProvider.call({
        method: 'nope',
        params: { add: [1, 2] },
        context: defaultContext,
      }),
      Error,
      'An error occured',
    );
  });
});
