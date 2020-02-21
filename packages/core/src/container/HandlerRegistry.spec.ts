// tslint:disable max-classes-per-file
import test from 'ava';
import { handler } from '@ilos/common';

import { Container } from '.';
import { Action } from '../foundation/Action';
import { HandlerRegistry } from './HandlerRegistry';

test('Handler registry: works', (t) => {
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

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
    }) instanceof HelloLocal,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
      queue: true,
    }) instanceof HelloLocalQueue,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: '*',
      local: true,
    }) instanceof HelloLocalStar,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'notExisting',
      local: true,
    }) instanceof HelloLocalStar,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
    }) instanceof HelloRemote,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
      queue: true,
    }) instanceof HelloRemote,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: '*',
      local: false,
    }) instanceof HelloRemoteStar,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'notExisting',
      local: false,
    }) instanceof HelloRemoteStar,
  );
});

test('Handler registry: fallback to remote', (t) => {
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

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
    }) instanceof HelloRemote,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'truc',
      local: true,
      queue: true,
    }) instanceof HelloRemoteStar,
  );
});
test('Handler registry: fallback to sync', (t) => {
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

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      queue: true,
      local: true,
    }) instanceof HelloLocal,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'truc',
      queue: true,
      local: true,
    }) instanceof HelloRemoteStar,
  );

  t.true(
    handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
      queue: true,
    }) instanceof HelloRemoteStar,
  );
});
