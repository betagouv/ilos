// tslint:disable max-classes-per-file
import { expect } from 'chai';
import { Kernel as BaseKernel, Extensions } from '@ilos/core';
import {
  provider,
  kernel as kernelDecorator,
  ConfigInterfaceResolver,
} from '@ilos/common';
import { Config } from '@ilos/config';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConnectionManagerExtension } from '@ilos/connection-manager';

import { ParentRepository } from '../src/index';

// process.env.APP_MONGO_URL = 'mongodb://mongo:mongo@127.0.0.1:27017';

const targetDb = 'ilos-test-' + new Date().getTime();

const targetCollection = 'mytestcollection';
const config = {
  mongo: {
    connectionString: process.env.APP_MONGO_URL,
    connectionOptions: {},
    db: targetDb,
  },
};
class User {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}
@provider()
class FakeConfig extends Config {
  async init() {
    // do nothing
  }
  get config() {
    return config;
  }
  set config(_value) {
    // do nothin
  }
}

@provider()
class UserRepository extends ParentRepository {
  constructor(
    protected config: ConfigInterfaceResolver,
    protected mongo: MongoConnection
  ) {
    super(config, mongo);
  }

  public getKey(): string {
    return targetCollection;
  }

  public getDbName(): string {
    return this.config.get('mongo.db');
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

@kernelDecorator({
  connections: [
    [MongoConnection, 'mongo'],
  ],
  providers: [
    UserRepository,
    [ConfigInterfaceResolver, FakeConfig],
  ],
})
class Kernel extends BaseKernel {
  extensions = [Extensions.Providers, ConnectionManagerExtension];
}

const kernel = new Kernel();

describe('Repository ', () => {
  before(async () => {
    await kernel.bootstrap();
  });

  after(async () => {
    await kernel.shutdown();
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
