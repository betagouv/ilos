// tslint:disable no-shadowed-variable max-classes-per-file
import test from 'ava';
import mockFs from 'mock-fs';

import { Env } from './Env';

test.before(() => {
  mockFs({
    [`${process.cwd()}/.env`]: 'HELLO=world\n',
  });
});

test.after(() => {
  mockFs.restore();
});

test('Env: should work', async (t) => {
  const env = new Env();
  await env.init();
  await env.loadEnvFile(process.cwd());
  t.is(env.get('HELLO'), 'world');
});

test('Env: should raise exception if key is not found', async (t) => {
  const env = new Env();
  await env.init();
  const err = t.throws(() => env.get('HELLO2'));
  t.is(err.message, 'Unknown env key HELLO2');
});

test('Env: should return fallback if key not found', async (t) => {
  const env = new Env();
  await env.init();
  t.is(env.get('HELLO2', 'world'), 'world');
});
