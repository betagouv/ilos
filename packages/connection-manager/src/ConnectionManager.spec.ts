import { Parents, Container, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { expect } from 'chai';

import { ConnectionManager } from './ConnectionManager';
import { ConnectionInterface, ConnectionDeclarationType } from './ConnectionManagerInterfaces';

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


class ConnectionExtension extends ConnectionManager {
  readonly connections: ConnectionDeclarationType[] = [
    {
      use: FakeDriverOne,
      withConfig: 'hello.world',
      inside: [FakeProviderOne],
    },
    {
      use: FakeDriverOne,
      withConfig: 'hello.world',
      inside: [FakeProviderTwo],
    },
    {
      use: FakeDriverTwo,
      withConfig: 'hello.you',
      inside: [FakeProviderOne, FakeProviderTwo],
    },
    {
      use: FakeDriverThree,
      withConfig: 'hello.world',
      inside: [FakeProviderOne],
    },
    [FakeDriverThree, 'hello.you'],
  ];
}

class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions = [ConnectionExtension];

  async register() {
    this.getContainer().bind(ConfigProviderInterfaceResolver).to(FakeConfigProvider);
    return super.register();
  }
}

describe('Connection manager', () => {
  it('container should work', async () => {
    const sp = new ServiceProvider();
    await sp.register();
    await sp.init();
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