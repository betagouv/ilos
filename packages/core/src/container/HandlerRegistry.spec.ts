// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { handler } from '@ilos/common';

import { Container } from '.';
import { Action } from '../foundation/Action';
import { HandlerRegistry } from './HandlerRegistry';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Handler registry', () => {
  it('works', async () => {
    @handler({
      service: 'hello',
      method: 'world',
    })
    class HelloLocal extends Action {}

    @handler({
      service: 'hello',
      method: 'world',
      queue: true,
    })
    class HelloLocalQueue extends Action {}

    @handler({
      service: 'hello',
      method: '*',
    })
    class HelloLocalStar extends Action {}

    @handler({
      service: 'hello',
      method: 'world',
      local: false,
    })
    class HelloRemote extends Action {}

    @handler({
      service: 'hello',
      method: 'world',
      queue: true,
      local: false,
    })
    class HelloRemoteQueue extends Action {}

    @handler({
      service: 'hello',
      method: '*',
      local: false,
    })
    class HelloRemoteStar extends Action {}

    const container = new Container();
    const handlerRegistry = new HandlerRegistry(container);

    handlerRegistry.set(HelloLocal);
    handlerRegistry.set(HelloLocalQueue);
    handlerRegistry.set(HelloLocalStar);
    handlerRegistry.set(HelloRemote);
    handlerRegistry.set(HelloRemoteQueue);
    handlerRegistry.set(HelloRemoteStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: true,
      }),
    ).to.be.instanceOf(HelloLocal);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: true,
        queue: true,
      }),
    ).to.be.instanceOf(HelloLocalQueue);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: '*',
        local: true,
      }),
    ).to.be.instanceOf(HelloLocalStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'notExisting',
        local: true,
      }),
    ).to.be.instanceOf(HelloLocalStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: false,
      }),
    ).to.be.instanceOf(HelloRemote);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: false,
        queue: true,
      }),
    ).to.be.instanceOf(HelloRemote);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: '*',
        local: false,
      }),
    ).to.be.instanceOf(HelloRemoteStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'notExisting',
        local: false,
      }),
    ).to.be.instanceOf(HelloRemoteStar);
  });

  it('fallback to remote', async () => {
    @handler({
      service: 'hello',
      method: 'world',
      local: false,
    })
    class HelloRemote extends Action {}

    @handler({
      service: 'hello',
      method: '*',
      local: false,
    })
    class HelloRemoteStar extends Action {}

    const container = new Container();
    const handlerRegistry = new HandlerRegistry(container);

    handlerRegistry.set(HelloRemote);
    handlerRegistry.set(HelloRemoteStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: true,
      }),
    ).to.be.instanceOf(HelloRemote);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'truc',
        local: true,
        queue: true,
      }),
    ).to.be.instanceOf(HelloRemoteStar);
  });

  it('fallback to sync', async () => {
    @handler({
      service: 'hello',
      method: 'world',
    })
    class HelloLocal extends Action {}

    @handler({
      service: 'hello',
      method: '*',
      local: false,
    })
    class HelloRemoteStar extends Action {}

    const container = new Container();
    const handlerRegistry = new HandlerRegistry(container);

    handlerRegistry.set(HelloLocal);
    handlerRegistry.set(HelloRemoteStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        queue: true,
        local: true,
      }),
    ).to.be.instanceOf(HelloLocal);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'truc',
        queue: true,
        local: true,
      }),
    ).to.be.instanceOf(HelloRemoteStar);

    expect(
      handlerRegistry.get({
        service: 'hello',
        method: 'world',
        local: false,
        queue: true,
      }),
    ).to.be.instanceOf(HelloRemoteStar);
  });
});
