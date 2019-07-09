import { MongoClient } from 'mongodb';

import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/connection-manager';

export class MongoConnection implements ConnectionInterface<MongoClient> {
  protected client: MongoClient;
  protected connected = false;

  constructor(protected config: ConnectionConfigurationType) {
    const { connectionString, connectionOptions } = this.config;
    const mongoConfig = {
      useNewUrlParser: true,
      ...connectionOptions,
    };

    this.client = new MongoClient(connectionString, mongoConfig);
  }

  async up() {
    try {
      if (!this.connected) {
        await this.client.connect();
        this.connected = true;
        return;
      }
    } catch (err) {
      throw err;
    }
  }

  async down() {
    try {
      if (this.connected) {
        await this.client.close();
        this.connected = false;
      }
    } catch (err) {
      throw err;
    }
  }

  getClient(): MongoClient {
    return this.client;
  }
}
