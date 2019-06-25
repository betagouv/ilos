import { describe } from 'mocha';
import { expect } from 'chai';

import { mapStatus } from './mapStatusCode';

describe('RPC/HTTP status codes mapping', () => {
  it('regular -> 200', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          result: {},
        },
      ).code,
    ).to.eq(200);
  });

  it('notification -> 204', () => {
    expect(
      mapStatus(
        {},
        {
          jsonrcp: '2.0',
          result: {},
        },
      ).code,
    ).to.eq(204);
  });

  it('Parse error -> 500', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32700, message: 'Parse error' },
        },
      ).code,
    ).to.eq(500);
  });

  it('Invalid Request -> 400', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32600, message: 'Invalid Request' },
        },
      ).code,
    ).to.eq(400);
  });

  it('Method not found -> 404', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32601, message: 'Method not found' },
        },
      ).code,
    ).to.eq(404);
  });

  it('Invalid Params -> 400', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32602, message: 'Invalid Params' },
        },
      ).code,
    ).to.eq(400);
  });

  it('Internal error -> 500', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32603, message: 'Internal error' },
        },
      ).code,
    ).to.eq(500);
  });

  it('Server error 32000 -> 500', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32000, message: 'Server error' },
        },
      ).code,
    ).to.eq(500);
  });

  it('Server error 32099 -> 500', () => {
    expect(
      mapStatus(
        { id: 1 },
        {
          id: 1,
          jsonrcp: '2.0',
          error: { code: -32000, message: 'Server error' },
        },
      ).code,
    ).to.eq(500);
  });
});
