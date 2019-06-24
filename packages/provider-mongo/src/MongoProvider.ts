import { MongoClient, Collection, Db } from 'mongodb';
import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { MongoProviderInterface } from './MongoProviderInterface';

@Container.provider()
export class MongoProvider implements MongoProviderInterface {
  protected client: MongoClient;
  protected connected = false;

  constructor(protected config: ConfigProviderInterfaceResolver) {}

  async boot(url = null) {
    const mongoConfig = {
      useNewUrlParser: true,
      ...this.config.get('mongo.config', {}),
    };

    const mongoUrl = url || this.config.get('mongo.url');

    this.client = new MongoClient(mongoUrl, mongoConfig);
  }

  protected async ensureConnected() {
    try {
      if (this.connected) {
        return;
      }
      await this.client.connect();
      this.connected = true;
    } catch (err) {
      throw err;
    }
  }

  async getDb(name: string): Promise<Db> {
    await this.ensureConnected();
    return this.client.db(name);
  }

  async getCollectionFromDb(collection: string, db: string): Promise<Collection> {
    await this.ensureConnected();
    return this.client.db(db).collection(collection);
  }

  async close() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}
