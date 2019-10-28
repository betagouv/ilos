import { Pool, PoolConfig } from 'pg';

import { ConnectionInterface } from '@ilos/common';

export class PostgresConnection implements ConnectionInterface<Pool> {
  protected pool: Pool;

  constructor(protected config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async up() {
    try {
      await this.pool.query('SELECT NOW()');
      return;
    } catch (err) {
      throw err;
    }
  }

  async down() {
    try {
      await this.pool.end();
    } catch (err) {
      throw err;
    }
  }

  getClient(): Pool {
    return this.pool;
  }
}
