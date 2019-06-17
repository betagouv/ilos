// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { Parents, Container } from '@ilos/core';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { MongoProvider, MongoProviderInterfaceResolver } from '@ilos/provider-mongo';

import { ParentRepositoryProvider } from '../src/index';

let mongoServer;
let connectionString;
let dbName;

class User {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}
@Container.provider()
class FakeConfigProvider extends ConfigProvider {
  protected config: object = {
    //
  };
  async boot() {
    //
  }
  setConfig(config) {
    this.config = config;
  }
}

@Container.provider()
class UserRepositoryProvider extends ParentRepositoryProvider {
  constructor(
    protected config: ConfigProviderInterfaceResolver,
    protected mongoProvider: MongoProviderInterfaceResolver
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return 'user';
  }

  public getDatabase(): string {
    return 'test';
  }

  public getSchema(): object | null {
    return {
      $id: 'user',
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'integer',
          minimum: 0,
          default: 18,
        },
      },
      required: ['name'],
    };
  }

  public getModel() {
    return User;
  }
}

class Kernel extends Parents.Kernel {
  alias = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [MongoProviderInterfaceResolver, MongoProvider],
    UserRepositoryProvider
  ];
}

const kernel = new Kernel();

describe('Repository provider', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    await kernel.boot();
    const container = kernel.getContainer();
    (<FakeConfigProvider>container.get(ConfigProviderInterfaceResolver)).setConfig({
      mongo: {
        url: connectionString,
        db: dbName,
      },
    });
  });

  after(async () => {
    await (<MongoProviderInterfaceResolver>kernel.getContainer().get(MongoProviderInterfaceResolver)).close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    await repository.clear();
  });

  it('should create new document', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    const r = await repository.create({
      name: 'Tom',
    });
    expect(r.name).to.equal('Tom');
  });

  it('should list documents', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    await repository.create({
      name: 'Tom',
    });
    const res = await repository.all();
    expect(res.length).to.eq(1);
    expect(res[0].name).to.eq('Tom');
  });

  it('should find document', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    const r = await repository.create({
      name: 'Tom',
    });
    const res = await repository.find(r._id);
    expect(res.name).to.eq('Tom');
  });

  it('should delete document', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    const r = await repository.create({
      name: 'Tom',
    });
    await repository.delete(r);
    const res = await repository.all();
    expect(res.length).to.eq(0);
  });

  it('should patch document', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    const r = await repository.create({
      name: 'Tom',
    });
    const res = await repository.patch(r._id, { name: 'Jon' });
    expect(res.name).to.eq('Jon');
  });

  it('should replace document', async () => {
    const repository = <UserRepositoryProvider>kernel.getContainer().get(UserRepositoryProvider);
    const r = await repository.create({
      name: 'Tom',
    });
    r.name = 'Sam';
    const res = await repository.update(r);
    expect(res.name).to.eq('Sam');
  });
});