import {
  injectable,
  METADATA_KEY,
} from 'inversify';

import { Metadata } from 'inversify/lib/planning/metadata';

import { HandlerConfig, AnyConfig } from './ContainerInterfaces';
import { HANDLER_META, PROVIDER_META } from './Metadata';

function extensionTag(config: AnyConfig) {
  return function(target) {
    Reflect.ownKeys(config).forEach((key: string) => {
      // Reflect.defineMetadata(`extension:${key}`, config[key], target.prototype);
      Reflect.defineMetadata(`extension:${key}`, config[key], target);
    });
    return target;
  }
}

export function provider(config: AnyConfig = {}) {
  return function (target) {
    if ('boot' in target.prototype) {
      const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, 'boot');
      Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target);
    }

    return injectable()(
      extensionTag(config)(target)
    );
  };
}

export function handler(config: HandlerConfig) {
  const { service } = config;
  let { method, version, local, queue, ...other } = config;

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
    Reflect.defineMetadata(HANDLER_META.SERVICE, service, target);
    Reflect.defineMetadata(HANDLER_META.METHOD, method, target);
    Reflect.defineMetadata(HANDLER_META.VERSION, version, target);
    Reflect.defineMetadata(HANDLER_META.LOCAL, local, target);
    Reflect.defineMetadata(HANDLER_META.QUEUE, queue, target);
    return injectable()(
      extensionTag(other)(target)
    );
  };
}

export function serviceProvider(config: AnyConfig) {
  return function(target) {
    return extensionTag(config)(target);
  }
}

export function command() { return injectable(); }
export function middleware() { return injectable(); }
export function lib() { return injectable(); }
export { injectable, inject } from 'inversify';
