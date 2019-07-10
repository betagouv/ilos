// tslint:disable max-classes-per-file
import { expect } from 'chai';

import { Parents, Container, Interfaces, Extensions } from '@ilos/core';
import { Config, ConfigInterfaceResolver } from '@ilos/config';
import { MongoConnection } from '@ilos/connection-mongo';

import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ParentMigrateCommand, ParentMigration } from '../src/commands/ParentMigrateCommand';

// process.env.APP_MONGO_URL = ' mongodb://mongo:mongo@127.0.0.1:27017';

const targetDb = 'ilos-test-' + new Date().getTime();
const migrationDb = 'ilos-test-migration-' + new Date().getTime();

const targetCollection = 'mytestcollection';
const migrationCollection = 'mymigrations';
const config = {
  mongo: {
    connectionString: process.env.APP_MONGO_URL,
    connectionOptions: {},
    db: targetDb,
  },
  migration: {
    db: migrationDb,
    collection: migrationCollection,
  }
};

@Container.provider()
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

@Container.kernel({
  providers: [
    [ConfigInterfaceResolver, FakeConfig],
  ],
  connections: [
    [MongoConnection, 'mongo'],
  ],
})
class Kernel extends Parents.Kernel {
  extensions = [Extensions.Providers, ConnectionManagerExtension];
}

const kernel = new Kernel();

@Container.injectable()
class FirstMigration extends ParentMigration {
  readonly signature = '20190527.FirstMigration';
  static signature = '20190527.FirstMigration';

  constructor(private mongo: MongoConnection) {
    super();
  }

  async up() {
    const db = await this.mongo.getClient().db(targetDb);
    await db.createCollection(targetCollection);
  }

  async down() {
    const db = await this.mongo.getClient().db(targetDb);
    await db.dropCollection(targetCollection);
  }
}

@Container.injectable()
class SecondMigration extends ParentMigration {
  readonly signature = '20190527.SecondMigration';
  static signature = '20190527.SecondMigration';

  constructor(private mongo: MongoConnection) {
    super();
  }

  async up() {
    const db = await this.mongo.getClient().db(targetDb);
    const collection = await db.collection(targetCollection);
    await collection.createIndex({ myindex: 1 });
  }

  async down() {
    const db = await this.mongo.getClient().db(targetDb);
    const collection = await db.collection(targetCollection);
    await (<any>collection.dropIndex)({ myindex: 1 });
  }
}

@Container.command()
class MigrateCommand extends ParentMigrateCommand {
  entity = 'test';
  migrations = [FirstMigration, SecondMigration];

  constructor(
    protected kernel: Interfaces.KernelInterfaceResolver,
    protected db: MongoConnection,
    protected config: ConfigInterfaceResolver,
  ) {
    super(kernel, db, config);
  }
}

describe('Repository provider: migrate', () => {
  before(async () => {
    await kernel.bootstrap();
  });

  after(async () => {
    await kernel.shutdown();
  });

  afterEach(async () => {
    const mongo = <MongoConnection>kernel.getContainer().get(MongoConnection);
    const collection = await mongo.getClient().db(migrationDb).collection(migrationCollection);
    try {
      await collection.drop();
    } catch {
      //
    }
  });

  it('should list available migrations', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const result = await command.call({ status: true, rollback: false, reset: false });
    expect(result).to.eq(`${FirstMigration.signature}: pending\n${SecondMigration.signature}: pending\n`);
  });

  it('should do migration', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = <MongoConnection>kernel.getContainer().get(MongoConnection);
    const db = await mongo.getClient().db(targetDb);
    const migrationCollectionInstance = await mongo.getClient().db(migrationDb).collection(migrationCollection);
    const result = await command.call({ status: false, rollback: false, reset: false });
    expect(result).to.eq(`${FirstMigration.signature}: success\n${SecondMigration.signature}: success\n`);
    const migrations = await migrationCollectionInstance.find({}).toArray();
    expect(migrations.length).to.eq(2);
    expect(migrations.map((m) => ({ signature: m._id, success: m.success }))).to.deep.equal([
      {
        signature: FirstMigration.signature,
        success: true,
      },
      {
        signature: SecondMigration.signature,
        success: true,
      },
    ]);
    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(1);
    expect(collections.map((c) => c.name)).to.deep.eq([targetCollection]);
    const collection = await db.collection(targetCollection);
    const indexes = await collection.indexes();
    expect(indexes.map((i) => Object.keys(i.key)).reduce((acc, i) => [...acc, ...i], [])).to.deep.eq([
      '_id',
      'myindex',
    ]);
  });

  it('should do rollback', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = <MongoConnection>kernel.getContainer().get(MongoConnection);
    const db = await mongo.getClient().db(targetDb);
    const migrationCollectionInstance = await mongo.getClient().db(migrationDb).collection(migrationCollection);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: 1, reset: false });

    expect(result).to.eq(`${SecondMigration.signature}: success\n`);

    const migrations = await migrationCollectionInstance.find({}).toArray();
    expect(migrations.length).to.eq(1);
    expect(migrations.map((m) => ({ signature: m._id, success: m.success }))).to.deep.equal([
      {
        signature: FirstMigration.signature,
        success: true,
      },
    ]);

    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(1);
    expect(collections.map((c) => c.name)).to.deep.eq([targetCollection]);
    const collection = await db.collection(targetCollection);
    const indexes = await collection.indexes();
    expect(indexes.map((i) => Object.keys(i.key)).reduce((acc, i) => [...acc, ...i], [])).to.deep.eq(['_id']);
  });
  it('should do reset', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = <MongoConnection>kernel.getContainer().get(MongoConnection);
    const db = await mongo.getClient().db(targetDb);
    const migrationCollectionInstance = await mongo.getClient().db(migrationDb).collection(migrationCollection);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: false, reset: 1 });
    expect(result).to.eq(`${SecondMigration.signature}: success\n${FirstMigration.signature}: success\n`);

    const migrations = await migrationCollectionInstance.find({}).toArray();
    expect(migrations.length).to.eq(0);

    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(0);
  });
});
