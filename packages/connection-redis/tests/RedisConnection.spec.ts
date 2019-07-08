import { expect } from 'chai';
import { RedisConnection } from '../src/RedisConnection';

const connection = new RedisConnection({connectionString: 'redis://127.0.0.1:6379'});
describe('Redis connection', () => {
  after(async () => {
    await connection.down();
  });

  it('works', (done) => {    
    connection.getClient().on('ready', () => {
      expect(true).to.eq(true);
      done();
    });
    connection.up();
  });
});
