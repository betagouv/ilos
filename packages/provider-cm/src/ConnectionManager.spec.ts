import { Parents, Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { expect } from 'chai';

import { ConnectionManager } from './ConnectionManager';
import { ConnectionInterface } from './ConnectionInterface';
import { ConnectionDeclaration } from './ConnectionManagerInterface';

class FakeDriverOne implements ConnectionInterface {
  constructor(public config: object) {
    //
  }

  async up(): Promise<void> {
    return;
  }

  async down(): Promise<void> {
    return;
  }

  getClient(): any {
    return this.config;
  }
}

class FakeDriverTwo implements ConnectionInterface {
  constructor(public config: object) {
    //
  }

  async up(): Promise<void> {
    return;
  }

  async down(): Promise<void> {
    return;
  }

  getClient(): any {
    return this.config;
  }
}

class FakeDriverThree implements ConnectionInterface {
  constructor(public config: object) {
    //
  }

  async up(): Promise<void> {
    return;
  }

  async down(): Promise<void> {
    return;
  }

  getClient() {
    return this.config;
  }
}

@Container.provider()
class FakeProviderOne {
  constructor(
    public driverOne: FakeDriverOne,
    public driverTwo: FakeDriverTwo,
    public driverThree: FakeDriverThree,
  ) {
    //
  }
}

@Container.provider()
class FakeProviderTwo {
  constructor(
    public driverOne: FakeDriverOne,
    public driverTwo: FakeDriverTwo,
    public driverThree: FakeDriverThree,
  ) {
    //
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  get(key: string) {
    if (key === 'hello.world') {
      return {
        hello: 'world',
      };
    }
    if (key === 'hello.you') {
      return {
        hello: 'you',
      };
    }
    return;
  }
}

class ServiceProvider extends Parents.ServiceProvider {
  readonly alias = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    ConnectionManager,
  ];

  readonly connections: ConnectionDeclaration[] = [
    [
      FakeProviderOne,
      [
        [FakeDriverOne, { shared: true, configKey: 'hello.world'}],
        [FakeDriverTwo, { shared: true, configKey: 'hello.you'}],
        [FakeDriverThree, { shared: true, configKey: 'hello.world'}],
      ],
    ],
    [
      FakeProviderTwo,
      [
        [FakeDriverOne, { shared: false, configKey: 'hello.world'}],
        [FakeDriverTwo, { shared: true, configKey: 'hello.you'}],
        [FakeDriverThree, { shared: true, configKey: 'hello.you'}],
      ],
    ],
 ];

 async boot() {
   await super.boot();
   const cm = this.getContainer().get(ConnectionManager);
   for(const serviceConnectionDefinition of this.connections) {
     const [ serviceConstructor, serviceConnections] = serviceConnectionDefinition;
     for(const connection of serviceConnections) {
       const [ connectionConstructor, connectionConfig ] = connection;
       cm.registerConnectionRequest(serviceConstructor, connectionConstructor, connectionConfig);
     }
   }
 }
}

describe('Connection manager', () => {
  it('container should work', async () => {
    const sp = new ServiceProvider();
    await sp.boot();
    const p1 = sp.getContainer().get(FakeProviderOne);
    const p2 = sp.getContainer().get(FakeProviderTwo);
    // shared = false
    expect(p1.driverOne).not.to.eq(p2.driverTwo);
    // shared = true
    expect(p1.driverTwo).to.eq(p2.driverTwo);
    // shared = true but config is different
    expect(p1.driverThree).not.to.eq(p2.driverThree);
  });
})