// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { EnvInterfaceResolver } from '@ilos/env';

import { Config } from './Config';

class FakeEnv extends EnvInterfaceResolver {
  async init() {
    return;
  }

  get(key: string, fallback?: any): any {
    return fallback;
  }
}

describe('Config provider', () => {
  it('should work with yaml', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.yml`]: `
        hi:\n
            - name: 'john' \n
        \n`,
    });

    const config = new Config(new FakeEnv());
    await config.init();
    expect(config.get('helloWorld')).to.deep.equal({
      hi: [
        { name: 'john' },
      ],
    });

    mockFs.restore();
  });

  it('should work with js', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.js`]: `module.exports.hi = [
        {
          name: env('FAKE', 'john'),
        },
      ];
      module.exports.test = false;`,
    });

    const config = new Config(new FakeEnv());
    await config.init();
    expect(config.get('helloWorld')).to.deep.include({
      hi: [
        { name: 'john' },
      ],
    });

    mockFs.restore();
  });

  it('should return fallback if key not found', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.js`]: `module.exports.hi = [
        {
          name: env('FAKE', 'john'),
        },
      ];
      module.exports.test = false;`,
    });

    const config = new Config(new FakeEnv());
    await config.init();
    expect(config.get('hello', 'world')).to.equal('world');

    mockFs.restore();
  });
});
