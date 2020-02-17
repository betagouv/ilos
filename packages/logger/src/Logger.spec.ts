// tslint:disable max-classes-per-file
import { expect } from 'chai';

import * as winston from 'winston';
import {
  injectable,
  provider,
  serviceProvider,
  HasLogger,
  LoggerInterface,
  EnvInterfaceResolver,
  DefaultLogger,
} from '@ilos/common';
import { ServiceContainer, Extensions } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';

import { LoggerExtension } from './LoggerExtension';

describe('Logger provider', () => {
  it('should have default logger', () => {
    @injectable()
    class Test extends HasLogger {
      getLogger(): LoggerInterface {
        return this.logger;
      }
    }
    class Service extends ServiceContainer {}
    const serviceContainer = new Service();

    serviceContainer.bind(Test);
    const test = serviceContainer.get(Test);
    expect(test.getLogger()).to.be.instanceOf(DefaultLogger);
  });

  it('should replace logger', async () => {
    @injectable()
    class Test extends HasLogger {
      getLogger(): LoggerInterface {
        return this.logger;
      }
    }

    @provider()
    class FakeEnv extends EnvInterfaceResolver {
      get(k, fb) {
        return fb;
      }
    }

    @serviceProvider({
      config: {},
    })
    class Service extends ServiceContainer {
      extensions = [LoggerExtension];
    }
    const serviceContainer = new Service();
    serviceContainer.bind(Test);
    await serviceContainer.register();
    await serviceContainer.init();

    const test = serviceContainer.get(Test);
    // TODO: check interface instead
    expect(test.getLogger().constructor.name).to.be.eq(winston.createLogger().constructor.name);
  });
});
