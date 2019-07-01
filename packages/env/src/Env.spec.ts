// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { Env } from './Env';

describe('Env', () => {
  before(() => {
    mockFs({
      [`${process.cwd()}/.env`]: 'HELLO=world\n',
    });
  });

  after(() => {
    mockFs.restore();
  });

  it('should work', async () => {
    const env = new Env();
    await env.boot();
    expect(env.get('HELLO')).to.equal('world');
  });

  it('should raise exception if key is not found', async () => {
    const env = new Env();
    await env.boot();
    expect(() => env.get('HELLO2')).throws(Error, 'Unknown env key HELLO2');
  });

  it('should return fallback if key not found', async () => {
    const env = new Env();
    await env.boot();
    expect(env.get('HELLO2', 'world')).to.equal('world');
  });
});

