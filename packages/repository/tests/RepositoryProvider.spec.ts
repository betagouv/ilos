// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { Parents, Container, Extensions } from '@ilos/core';
import { Config, ConfigInterfaceResolver } from '@ilos/config';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConnectionManager } from '@ilos/connection-manager';

import { ParentRepository } from '../src/index';

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
class UserRepository extends ParentRepository {
  constructor(
    protected config: ConfigInterfaceResolver,
    protected mongo: MongoConnection
  ) {
    super(config, mongo);
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

@Container.kernel({
  connections: [
    [MongoConnection, 'mongo'],
  ],
  providers: [
    UserRepository,
    [ConfigInterfaceResolver, FakeConfig],
  ],
})
class Kernel extends Parents.Kernel {
  extensions = [Extensions.Providers, ConnectionManager];
}

const kernel = new Kernel();

describe('Repository ', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    config.mongo.connectionString = connectionString;
    config.mongo.db = dbName;

    await kernel.bootstrap();
  });

  after(async () => {
    await kernel.shutdown();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    await repository.clear();
  });

  it('should create new document', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    const r = await repository.create({
      name: 'Tom',
    });
    expect(r.name).to.equal('Tom');
  });

  it('should list documents', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    await repository.create({
      name: 'Tom',
    });
    const res = await repository.all();
    expect(res.length).to.eq(1);
    expect(res[0].name).to.eq('Tom');
  });

  it('should find document', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    const r = await repository.create({
      name: 'Tom',
    });
    const res = await repository.find(r._id);
    expect(res.name).to.eq('Tom');
  });

  it('should delete document', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    const r = await repository.create({
      name: 'Tom',
    });
    await repository.delete(r);
    const res = await repository.all();
    expect(res.length).to.eq(0);
  });

  it('should patch document', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    const r = await repository.create({
      name: 'Tom',
    });
    const res = await repository.patch(r._id, { name: 'Jon' });
    expect(res.name).to.eq('Jon');
  });

  it('should replace document', async () => {
    const repository = <UserRepository>kernel.getContainer().get(UserRepository);
    const r = await repository.create({
      name: 'Tom',
    });
    r.name = 'Sam';
    const res = await repository.update(r);
    expect(res.name).to.eq('Sam');
  });
});
