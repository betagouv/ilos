import { HttpHandler } from '../HttpHandler';
import { Container, Types, Interfaces } from '@ilos/core';
/**
 * httpHandlerFactory - Create a HttpHandler for a remote service
 * @export
 * @param {string} service - service name
 * @param {string} url - service url
 * @param {string} [version]
 * @returns {NewableType<HandlerInterface>}
 */
export function httpHandlerFactory(service: string, url: string, version?: string): Types.NewableType<Interfaces.HandlerInterface> {
  @Container.handler({
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

