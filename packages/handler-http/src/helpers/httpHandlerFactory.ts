
import { HttpHandler } from '../HttpHandler';
import { Container, Types, Interfaces } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
/**
* httpHandlerFactory - Create a HttpHandler for a remote service
* @export
* @param {string} service - service name
* @param {string} url - service url
* @param {string} [version]
* @returns {NewableType<HandlerInterface>}
*/
export function httpHandlerFactory(service: string, url: string, version?: string): Types.NewableType<Interfaces.HandlerInterface> {
  let isFromConfig = false
  if (!/http/.test(url)) {
    isFromConfig = true
  }
  @Container.handler({
    service,
    version,
    method: '*',
    local: false,
  })
  class CustomHttpHandler extends HttpHandler {
    constructor(
      private config: ConfigInterfaceResolver,
      ) {
      super();
    }

    protected readonly service: string = service;
    protected readonly version: string = version;

    public boot(){
      if(isFromConfig){
        this.createClient(this.config.get(url))
      } else {
        this.createClient(url)
      }
    }

  }

  return CustomHttpHandler;
}