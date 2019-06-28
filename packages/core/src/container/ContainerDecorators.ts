import {
  injectable,
  METADATA_KEY,
} from 'inversify';

import { Metadata } from 'inversify/lib/planning/metadata';

import { HandlerConfig } from './ContainerInterfaces';

export function provider() {
  return function (target) {
    if ('boot' in target.prototype) {
      const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, 'boot');
      Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target);
    }
    return injectable()(target);
  };
}

export function handler(config: HandlerConfig) {
  const { service } = config;
  let { method, version, local, queue } = config;

  if (!('method' in config)) {
    method = '*';
  }
  if (!('version' in config)) {
    version = 'latest';
  }
  if (!('local' in config)) {
    local = true;
  }
  if (!('queue' in config)) {
    queue = false;
  }
  return function (target) {
    Reflect.defineMetadata('rpc:service', service, target);
    Reflect.defineMetadata('rpc:method', method, target);
    Reflect.defineMetadata('rpc:version', version, target);
    Reflect.defineMetadata('rpc:local', local, target);
    Reflect.defineMetadata('rpc:queue', queue, target);
    return injectable()(target);
  };
}

export function command() { return injectable(); }
export function middleware() { return injectable(); }
export function lib() { return injectable(); }
export { injectable, inject } from 'inversify';
