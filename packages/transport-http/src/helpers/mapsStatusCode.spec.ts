// tslint:disable: prefer-type-cast

import { describe } from 'mocha';
import { expect } from 'chai';

import { mapStatusCode } from './mapStatusCode';

describe('RPC/HTTP status codes mapping', () => {
  it('regular -> 200', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        result: {},
      }),
    ).to.eq(200);
  });

  it('notification -> 204', () => {
    expect(
      mapStatusCode({} as any, {
        id: 1,
        jsonrpc: '2.0',
        result: {},
      }),
    ).to.eq(204);
  });

  it('Parse error -> 500', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
      }),
    ).to.eq(500);
  });

  it('Invalid Request -> 400', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
      }),
    ).to.eq(400);
  });

  it('Method not found -> 404', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
      }),
    ).to.eq(404);
  });

  it('Invalid Params -> 400', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid Params' },
      }),
    ).to.eq(400);
  });

  it('Internal error -> 500', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal error' },
      }),
    ).to.eq(500);
  });

  it('Server error 32000 -> 500', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server error' },
      }),
    ).to.eq(500);
  });

  it('Server error 32099 -> 500', () => {
    expect(
      mapStatusCode({ id: 1 } as any, {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server error' },
      }),
    ).to.eq(500);
  });
});
