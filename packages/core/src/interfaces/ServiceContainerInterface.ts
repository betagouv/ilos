import { ContainerInterface } from '../container';
import { ExtensionStaticInterface } from './ExtentionInterface';
import { HookInterface } from './hooks';
import { NewableType } from '../types';

export interface ServiceContainerConstructorInterface<T = any> {
  new (container?: ContainerInterface) : T;
}

export interface ServiceContainerInterface {
  readonly extensions: ExtensionStaticInterface[];
  registerHooks(hooker: object, identifier?: NewableType<any>): void;

  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer():ContainerInterface;
}

export abstract class ServiceContainerInterfaceResolver implements ServiceContainerInterface {
  readonly extensions: ExtensionStaticInterface[] = [];

  registerHooks(hooker: object, identifier?: NewableType<any>): void {
    throw new Error();
  }

  getContainer():ContainerInterface {
    throw new Error();
  }
}

export const BEFORE_CONSTRUCT = 0;
export const AFTER_CONSTRUCT = 1;
export const BEFORE_REGISTER = 2;
export const AFTER_REGISTER = 3;
export const BEFORE_INIT = 4;
export const AFTER_INIT = 5;
export const BEFORE_DESTROY = 6;
export const AFTER_DESTROY = 7;

export type StatusType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
