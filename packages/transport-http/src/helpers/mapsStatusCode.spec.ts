// tslint:disable: prefer-type-cast

import { describe } from 'mocha';
import { expect } from 'chai';

import { mapStatusCode } from './mapStatusCode';

describe('RPC/HTTP status codes mapping', () => {
  it('regular -> 200', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        result: {},
      }),
    ).to.eq(200);
  });

  it('notification -> 204', () => {
    expect(mapStatusCode()).to.eq(204);
  });

  it('Parse error -> 422', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
      }),
    ).to.eq(422);
  });

  it('Invalid Request -> 400', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
      }),
    ).to.eq(400);
  });

  it('Invalid Params -> 400', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid Params' },
      }),
    ).to.eq(400);
  });

  it('Method not found -> 405', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
      }),
    ).to.eq(405);
  });

  it('Internal error -> 500', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal error' },
      }),
    ).to.eq(500);
  });

  it('Server error 32000 -> 500', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server error' },
      }),
    ).to.eq(500);
  });

  it('Server error 32099 -> 500', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server error' },
      }),
    ).to.eq(500);
  });

  it('Unauthorized -> 401', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32501, message: 'Unauthorized' },
      }),
    ).to.eq(401);
  });

  it('Forbidden -> 403', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32503, message: 'Forbidden' },
      }),
    ).to.eq(403);
  });

  it('Conflict -> 409', () => {
    expect(
      mapStatusCode({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32509, message: 'Conflict' },
      }),
    ).to.eq(409);
  });
});
