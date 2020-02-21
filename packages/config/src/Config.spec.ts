// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import test from 'ava';
import mockFs from 'mock-fs';
import { EnvInterfaceResolver } from '@ilos/common';

import { Config } from './Config';

function setup() {
  class FakeEnv extends EnvInterfaceResolver {
    async init() {
      return;
    }
  
    get(key: string, fallback?: any): any {
      return fallback;
    }
  }

  return {
    env: new FakeEnv(),
  };
}

test('Config provider: should work with yaml', async (t) => {
  mockFs({
    [`${process.cwd()}/config/hello-world.yml`]: `
      hi:\n
          - name: 'john' \n
      \n`,
  });
  const { env } = setup();
  const config = new Config(env);
  await config.init();
  t.deepEqual(config.get('helloWorld'), {
    hi: [{ name: 'john' }],
  });

  mockFs.restore();
});

test('Config provider: should work with js', async (t) => {
  mockFs({
    [`${process.cwd()}/config/hello-world.js`]: `module.exports.hi = [
      {
        name: env('FAKE', 'john'),
      },
    ];
    module.exports.test = false;`,
  });
  const { env } = setup();
  const config = new Config(env);
  await config.init();
  t.deepEqual(config.get('helloWorld'), {
    hi: [{ name: 'john' }],
    test: false,
  });

  mockFs.restore();
});

test('Config provider: should return fallback if key not found', async (t) => {
  mockFs({
    [`${process.cwd()}/config/hello-world.js`]: `module.exports.hi = [
      {
        name: env('FAKE', 'john'),
      },
    ];
    module.exports.test = false;`,
  });
  const { env } = setup();
  const config = new Config(env);
  await config.init();
  t.is(config.get('hello', 'world'), 'world');
  mockFs.restore();
});
