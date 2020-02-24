import test from 'ava';

import { env } from './env';
import { ConfigNotFoundException } from './ConfigNotFoundException';

test.before(() => {
  process.env['TEST_HELLO'] = 'world';
});

test.after(() => {
  delete process.env['TEST_HELLO'];
});

test('env(): works with existing value', (t) => {
  t.is(env('TEST_HELLO'), 'world');
});

test('env(): works with missing value and fallback', (t) => {
  t.is(env('TEST_MISSING', 'world'), 'world');
});

test('env(): throws with missing value and no fallback', (t) => {
  t.throws(() => env('TEST_MISSING'), { instanceOf: ConfigNotFoundException }, "Config key 'TEST_MISSING' not found");
});

test('env(): works with missing value and number fallback', (t) => {
  t.is(env('TEST_MISSING', 1234), 1234);
});

test('env(): works with missing value and boolean fallback', (t) => {
  t.is(env('TEST_MISSING', false), false);
});
