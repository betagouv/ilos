import { HttpHandler } from '../HttpHandler';
import { handler } from '@ilos/container';
import { Types, Interfaces } from '@ilos/core';
/**
 * httpHandlerFactory - Create a HttpHandler for a remote service
 * @export
 * @param {string} service - service name
 * @param {string} url - service url
 * @param {string} [version]
 * @returns {NewableType<HandlerInterface>}
 */
export function httpHandlerFactory(service: string, url: string, version?: string): Types.NewableType<Interfaces.HandlerInterface> {
  @handler({
    service,
    version,
    method: '*',
    local: false,
  })
  class CustomHttpHandler extends HttpHandler {
    protected readonly service: string = service;
    protected readonly version: string = version;
    protected readonly url: string = url;
  }
  return CustomHttpHandler;
}
  