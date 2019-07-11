// tslint:disable max-classes-per-file
import { expect } from 'chai';
import {
  InitHookInterface,
  provider,
  serviceProvider,
} from '@ilos/common';

import { Providers } from './Providers';
import { ServiceContainer } from '../parents/ServiceContainer';

describe('Providers extension', () => {
  it('works', async () => {
    abstract class ProviderResolver {
      scream(): string {
        throw new Error();
      }
    }
    
    @provider({
      identifier: ProviderResolver,
    })
    class Provider {
      scream(): string {
        return 'AAA';
      }
    }
    
    @serviceProvider({
      providers: [Provider],
    })

    class ServiceProvider extends ServiceContainer {
      extensions = [Providers];
    }
    const test = new ServiceProvider();

    await test.register();
    
    const screamer = test.getContainer().get(ProviderResolver);
    expect(screamer.scream()).to.eq('AAA');
  });

  it('works with multiple bindings', async () => {
    abstract class ProviderResolver {
      screamed = 0;
      scream(): string {
        throw new Error();
      }
    }
    
    @provider({
      identifier: [
        ProviderResolver,
        'aaa',
      ],
    })
    class Provider {
      screamed = 0;
      scream(): string {
        this.screamed = 1;
        return 'AAA';
      }
    }
    
    @serviceProvider({
      providers: [Provider],
    })
    class ServiceProvider extends ServiceContainer {
      extensions = [Providers];
    }

    const test = new ServiceProvider();

    await test.register();
    const container = test.getContainer();
    const screamer = container.get(ProviderResolver);
    expect(screamer.scream()).to.eq('AAA');
    const screamer1 = container.get<ProviderResolver>('aaa');
    expect(screamer1.screamed).to.eq(1);
  });

  it('works with init hook', async () => {
    abstract class ProviderResolver {
      scream(): string {
        throw new Error();
      }
    }
    
    @provider({
      identifier: ProviderResolver,
    })
    class Provider implements InitHookInterface {
      screamType = 'AAA';
      init() {
        this.screamType = 'BBB';
      }
      scream(): string {
        return this.screamType;
      }
    }
    
    @serviceProvider({
      providers: [Provider],
    })

    class ServiceProvider extends ServiceContainer {
      extensions = [Providers];
    }
    const test = new ServiceProvider();

    await test.register();
    await test.init();
    
    const screamer = test.getContainer().get(ProviderResolver);
    expect(screamer.scream()).to.eq('BBB');
  });
});