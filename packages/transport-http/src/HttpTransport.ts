import http from 'http';

import { Interfaces, Types } from '@ilos/core';

import { mapStatus } from './helpers/mapStatusCode';

/**
 * Http Transport
 * @export
 * @class HttpTransport
 * @implements {TransportInterface}
 */
export class HttpTransport implements Interfaces.TransportInterface {
  server: http.Server;
  kernel: Interfaces.KernelInterface;

  constructor(kernel: Interfaces.KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): Interfaces.KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    this.server = http.createServer((req, res) => {
      if (
        !('content-type' in req.headers && 'accept' in req.headers) ||
        req.headers['content-type'] !== 'application/json' ||
        req.headers.accept !== 'application/json'
      ) {
        res.statusCode = 415;
        res.end('Wrong content type header');
      }
      // Add Host/Origin check

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
      }

      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          // Add Length check
          if (Number(req.headers['content-length']) !== data.length + 1) {
            // console.log(Number(req.headers['content-length']), data.length)
            // TODO repair, this is not working
            // throw new Error();
          }

          const call: Types.RPCCallType = JSON.parse(data);
          // TODO : add channel ?
          this.kernel
            .handle(call)
            .then((results) => {
              const { code, message, data: statusData } = mapStatus(call, results);

              res.setHeader('content-type', 'application/json');
              res.statusCode = code;

              // return a response or an error object
              if (code < 400) {
                res.end(JSON.stringify(results));
              } else {
                res.end(
                  JSON.stringify({
                    error: {
                      code,
                      message: `${message}: ${statusData}`,
                    },
                  }),
                );
              }
            })
            .catch((e) => {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error: {
                    code: 500,
                    message: e.message,
                  },
                }),
              );
            });
        } catch (err) {
          res.statusCode = 415;
          res.end('Wrong request');
        }
      });

      req.on('error', () => {
        res.statusCode = 400;
        res.end();
      });
    });
    const [optsPort] = opts;
    const port = optsPort ? Number(optsPort) : 8080;

    this.server.listen(port);
  }

  async down() {
    this.server.close();
  }
}
