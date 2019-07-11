import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import {
  ParamsType,
  ContextType,
  ResultType,
} from '@ilos/common';
import { Exceptions } from '@ilos/core';

import { RoleMiddleware } from './RoleMiddleware';

chai.use(chaiAsPromised);
const { expect } = chai;

const middleware = new RoleMiddleware();

async function noop(params, context) {
  return;
}

const callFactory = (group: string, role: string) => ({
  method: 'test',
  context: <ContextType>{
    channel: {
      service: '',
      transport: 'http',
    },
    call: {
      user: {
        group,
        role,
      },
    },
  },
  params: <ParamsType>{},
  result: <ResultType>null,
});

describe('Role middleware', () => {
  it('works: super admin', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, ['superAdmin'])).to.become(undefined);
  });

  it('works: admin', async () => {
    const { params, context } = callFactory('operator', 'admin');
    await expect(middleware.process(params, context, noop, ['admin'])).to.become(undefined);
  });

  it('works: user', async () => {
    const { params, context } = callFactory('aom', 'user');
    await expect(middleware.process(params, context, noop, ['user'])).to.become(undefined);
  });

  it('works: aom', async () => {
    const { params, context } = callFactory('aom', 'admin');
    await expect(middleware.process(params, context, noop, ['admin'])).to.become(undefined);
  });

  it('works: operator', async () => {
    const { params, context } = callFactory('operator', 'admin');
    await expect(middleware.process(params, context, noop, ['admin'])).to.become(undefined);
  });

  it('works: registry', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, ['admin'])).to.become(undefined);
  });

  it('fails: unknown', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, ['unknown'])).to.be.rejectedWith(Exceptions.ForbiddenException);
  });

  it('fails: null', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, [null])).to.be.rejectedWith(Exceptions.InvalidParamsException);
  });

  it('fails: empty', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, [])).to.be.rejectedWith(Exceptions.InvalidParamsException);
  });

  it('fails: undefined', async () => {
    const { params, context } = callFactory('registry', 'admin');
    await expect(middleware.process(params, context, noop, [undefined])).to.be.rejectedWith(Exceptions.InvalidParamsException);
  });
});
