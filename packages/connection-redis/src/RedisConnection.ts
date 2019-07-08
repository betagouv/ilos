import { Redis as RedisInterface } from 'ioredis';
import Redis from 'ioredis';
import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/connection-manager';

export class RedisConnection implements ConnectionInterface<RedisInterface> {
  protected client: RedisInterface;
  protected connected = false;

  constructor(config: ConnectionConfigurationType) {
    if (!!config.connectionString) {
      const { connectionString, ...other } = config;
      this.client = new Redis(
        connectionString,
        {
          ...other,
          lazyConnect: true,
        });
    } else {
      this.client = new Redis({
        ...config,
        lazyConnect: true,
      });
    }
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
        await this.client.disconnect();
        this.connected = false;
      }
    } catch(err) {
      throw err;
    }
  }

  getClient(): RedisInterface {
    return this.client;
  }
}

// var {REDIS_URL} = process.env

// var Redis = require('ioredis')
// var client = new Redis(REDIS_URL);
// var subscriber = new Redis(REDIS_URL);

// var opts = {
//   createClient: function (type) {
//     switch (type) {
//       case 'client':
//         return client;
//       case 'subscriber':
//         return subscriber;
//       default:
//         return new Redis();
//     }
//   }
// }

// var queueFoo = new Queue('foobar', opts);
// var queueQux = new Queue('quxbaz', opts);