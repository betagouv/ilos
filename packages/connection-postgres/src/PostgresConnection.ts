
import { Client, ClientConfig } from 'pg';
import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/common';

export class PostgresConnection implements ConnectionInterface<Client> {
  protected client: Client;
  protected connected = false;

  constructor(protected config: ClientConfig) {
    this.client = new Client(config);
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
        await this.client.end();
        this.connected = false;
      }
    } catch (err) {
      throw err;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
