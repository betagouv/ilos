// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { Parents, Container } from '@ilos/core';
import { Config, ConfigInterfaceResolver } from '@ilos/config';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConnectionManager as ParentConnectionManager, ConnectionDeclarationType } from '@ilos/connection-manager';

import { ParentRepositoryProvider } from '../src/index';

let mongoServer;
let connectionString;
let dbName;
const config = {
  mongo: {
    connectionString: null,
    connectionOptions: {},
    db: null,
  },
};

class User {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}
@Container.provider()
class FakeConfig extends Config {
  protected config: object = {
    //
  };

  async boot() {
    this.config = config;
  }
}

@Container.provider()
class UserRepositoryProvider extends ParentRepositoryProvider {
  constructor(
    protected config: ConfigInterfaceResolver,
    protected mongoProvider: MongoConnection
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

class ConnectionManager extends ParentConnectionManager {
  readonly connections: ConnectionDeclarationType[] = [
    [MongoConnection, 'mongo'],
  ];
}

class Kernel extends Parents.Kernel {
  alias = [
    [ConfigInterfaceResolver, FakeConfig],
    UserRepositoryProvider
  ];

  serviceProviders = [
    ConnectionManager,
  ];
}

const kernel = new Kernel();

describe('Repository provider', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    config.mongo.connectionString = connectionString;
    config.mongo.db = dbName;

    await kernel.boot();
  });

  after(async () => {
    await kernel.shutdown();
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
