import test from 'ava';

import { Config } from './Config';

test('Config provider: works with simple object', async (t) => {
  const config = new Config();
  config.set('helloWorld', { hello: 'world' });
  t.deepEqual(config.get('helloWorld'), { hello: 'world' });
});

test('Config provider: fails if not found without fallback', async (t) => {
  const config = new Config();
  config.set('helloWorld', { hello: 'world' });
  t.throws(() => config.get('helloMissing'), { instanceOf: Error }, "Unknown config key 'helloMissing'");
});

test('Config provider: works if not found with fallback', async (t) => {
  const config = new Config();
  config.set('helloWorld', { hello: 'world' });
  t.deepEqual(config.get('helloMissing', { hello: 'fallback' }), { hello: 'fallback' });
});

test('Config provider: fails on duplicate key', async (t) => {
  const config = new Config();
  config.set('helloWorld', { hello: 'world' });
  t.throws(
    () => config.set('helloWorld', { hello: 'world2' }),
    { instanceOf: Error },
    "Duplicate config key 'helloWorld'",
  );
});
