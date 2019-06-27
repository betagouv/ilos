import { describe } from 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';

import { Parents, Types } from '@ilos/core';

import { HttpTransport } from './HttpTransport';

let request: supertest.SuperTest<supertest.Test>;
let httpTransport: HttpTransport;

describe('Http transport', () => {
  before(() => {
    class BasicKernel extends Parents.Kernel {
      async handle(call: Types.RPCCallType): Promise<Types.RPCResponseType> {
        // generate errors from method name
        if ('method' in call) {
          switch (call.method) {
            case 'test':
              // notifications return void
              if (call.id === undefined || call.id === null) {
                return;
              }

              return {
                id: 1,
                jsonrpc: '2.0',
                result: 'hello world',
              };
            case 'error':
              return {
                id: 1,
                jsonrpc: '2.0',
                error: {
                  code: -32000,
                  message: 'Server error',
                },
              };
            case 'invalidRequest':
              return {
                id: 1,
                jsonrpc: '2.0',
                error: {
                  code: -32600,
                  message: 'Server error',
                },
              };
          }
        }

        return {
          id: 1,
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found',
          },
        };
      }
    }

    const kernel = new BasicKernel();

    httpTransport = new HttpTransport(kernel);

    httpTransport.up();

    request = supertest(httpTransport.getInstance());
  });

  after(() => {
    httpTransport.down();
  });

  it('returns JSON-RPC compliant success response', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      result: 'hello world',
    });
  });

  it('returns JSON-RPC compliant error response', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'returnAnError',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).to.equal(405);
    expect(response.body).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: 'Method not found',
      },
    });
  });

  it('regular request', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(200);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('result');
  });

  it('notification request', async () => {
    const response = await request
      .post('/')
      .send({
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(204);
    expect(response.body).to.equal('');
  });

  it('should fail if missing Accept header', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Content-Type', 'application/json');
    expect(response.status).equal(415);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });

  // Content-type is infered from Accept header
  it('should work without Content-type header', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Accept', 'application/json');
    expect(response.status).equal(200);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('result');
  });

  it('should fail if http verb is not POST', async () => {
    const response = await request
      .get('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(405);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });

  it('should fail if json is misformed', async () => {
    const response = await request
      .post('/')
      .send('{ "id": 1, jsonrpc: "2.0", "method": "test"}')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(415);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });

  it('should fail if service reject', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'error',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(500);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });

  it('should fail if request is invalid', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'invalidRequest',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(400);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });

  it('should fail if method is not found', async () => {
    const response = await request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'nonExistingMethod',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(response.status).equal(405);
    expect(response.body).to.have.property('id', 1);
    expect(response.body).to.have.property('jsonrpc', '2.0');
    expect(response.body).to.have.property('error');
  });
});
