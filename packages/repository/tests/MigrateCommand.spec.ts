// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';

import { Parents, Container, Interfaces, Extensions } from '@ilos/core';
import { Config, ConfigInterfaceResolver } from '@ilos/config';
import { MongoConnection } from '@ilos/connection-mongo';

import { ConnectionManager } from '@ilos/connection-manager';
import { ParentMigrateCommand, ParentMigration } from '../src/commands/ParentMigrateCommand';

let mongoServer;
let connectionString;
let dbName;
const targetDb = 'test';
const targetCollection = 'mytestcollection';
const collectionName = 'mymigrations';
const config = {
  mongo: {
    connectionString: null,
    connectionOptions: {},
    db: null,
  },
  migration: {
    db: null,
    collection: collectionName,
  }
};

@Container.provider()
class FakeConfig extends Config {
  protected config: object = {
    //
  };

  async boot() {
    this.config = config;
  }
}

@Container.kernel({
  connections: [
    [MongoConnection, 'mongo'],
  ],
  providers: [
    [ConfigInterfaceResolver, FakeConfig],
  ],
})
class Kernel extends Parents.Kernel {
  extensions = [Extensions.Providers, ConnectionManager];
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
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    config.mongo.connectionString = connectionString;
    config.mongo.db = dbName;
    config.migration.db = dbName;
    await kernel.bootstrap();
  });

  after(async () => {
    await kernel.shutdown();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const mongo = <MongoConnection>kernel.getContainer().get(MongoConnection);
    const collection = await mongo.getClient().db(dbName).collection(collectionName);
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
    const migrationCollection = await mongo.getClient().db(dbName).collection(collectionName);
    const result = await command.call({ status: false, rollback: false, reset: false });
    expect(result).to.eq(`${FirstMigration.signature}: success\n${SecondMigration.signature}: success\n`);
    const migrations = await migrationCollection.find({}).toArray();
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
    const migrationCollection = await mongo.getClient().db(dbName).collection(collectionName);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: 1, reset: false });

    expect(result).to.eq(`${SecondMigration.signature}: success\n`);

    const migrations = await migrationCollection.find({}).toArray();
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
    const migrationCollection = await mongo.getClient().db(dbName).collection(collectionName);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: false, reset: 1 });
    expect(result).to.eq(`${SecondMigration.signature}: success\n${FirstMigration.signature}: success\n`);

    const migrations = await migrationCollection.find({}).toArray();
    expect(migrations.length).to.eq(0);

    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(0);
  });
});
