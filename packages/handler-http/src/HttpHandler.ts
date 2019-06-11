import axios, { AxiosInstance } from 'axios';
import { Types, Interfaces, Exceptions } from '@ilos/core';

/**
 * Http handler
 * @export
 * @class HttpHandler
 * @implements {HandlerInterface}
 */
export class HttpHandler implements Interfaces.HandlerInterface {
  public readonly middlewares: (string|[string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;
  protected readonly url: string;

  private client: AxiosInstance;

  public boot() {
    this.client = axios.create({
      baseURL: this.url,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public async call(call: Types.CallType): Promise<Types.ResultType> {
    const { method, params, context } = call;
    try {
      // TODO : add channel ?
      const response = await this.client.post('/', {
        method,
        params: {
          params,
          _context: context,
        },
        id: 1,
        jsonrpc: '2.0',
      });

      if (!('data' in response) || !('result' in response.data)) {
        throw new Exceptions.ServiceException(response.data.error);
      }
      call.result = response.data.result;
      return response.data.result;
    } catch (e) {
      if (e.serviceError) {
        throw new Error(e.message);
      }
      throw new Error('An error occured');
    }
  }
}
