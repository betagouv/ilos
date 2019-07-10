// tslint:disable max-classes-per-file
import { expect } from 'chai';
import axios from 'axios';
import { HttpTransport } from '@ilos/transport-http';
import { Container, Interfaces } from '@ilos/core';
import { Kernel } from '../src/Kernel';

import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider';
import { ServiceProvider as StringServiceProvider } from './mock/StringService/ServiceProvider';

// process.env.APP_REDIS_URL = 'redis://127.0.0.1:6379';

@Container.kernel({
  children: [
    MathServiceProvider,
    StringServiceProvider,
  ],
})
class MyKernel extends Kernel {
}

function makeRPCCall(port: number, req: { method: string; params?: any }[]) {
  let data;

  if (req.length === 1) {
    data = {
      jsonrpc: '2.0',
      method: req[0].method,
      params: req[0].params,
      id: 0,
    };
  } else {
    data = [];
    for (const i of Object.keys(req)) {
      data.push({
        jsonrpc: '2.0',
        method: req[i].method,
        params: req[i].params,
        id: Number(i),
      });
    }
  }
  return axios.post(`http://127.0.0.1:${port}`, data, {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
  });
}
let transport: Interfaces.TransportInterface;
let kernel: Interfaces.KernelInterface;

describe('Merged integration', () => {
  before(async () => {
    kernel = new MyKernel();
    await kernel.bootstrap();
    transport = new HttpTransport(kernel);
    await transport.up(['8080']);
  });

  after(async () => {
    await transport.down();
    await kernel.shutdown();
  });

  it('should works', async () => {
    const responseMath = await makeRPCCall(8080, [
      { method: 'math:add', params: [1, 1] },
    ]);
    expect(responseMath.data).to.deep.equal({
      jsonrpc: '2.0',
      id: 0,
      result: 'math:2',
    });

    const responseString = await makeRPCCall(8080, [
      { method: 'string:hello', params: { name: 'sam' } },
    ]);
    expect(responseString.data).to.deep.equal({
      jsonrpc: '2.0',
      id: 0,
      result: 'string:Hello world sam',
    });

    const response = await makeRPCCall(8080, [
      { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
      { method: 'string:result', params: { name: 'john', add: [1, 10] } },
    ]);

    expect(response.data).to.deep.equal([
      {
        jsonrpc: '2.0',
        id: 0,
        result: 'string:Hello world sam, result is math:2',
      },
      {
        jsonrpc: '2.0',
        id: 1,
        result: 'string:Hello world john, result is math:11',
      },
    ]);
  });
});
