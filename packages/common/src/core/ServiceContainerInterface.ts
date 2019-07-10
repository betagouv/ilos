// import { ContainerInterface } from '../container';
import { ExtensionStaticInterface } from './ExtentionInterface';
import { ContainerInterface, IdentifierType } from '../container';

export type ServiceContainerConstructorInterface<T = any> = new (parent?: ServiceContainerInterface) => T;

export interface ServiceContainerInterface {
  readonly extensions: ExtensionStaticInterface[];
  registerHooks(hooker: object, identifier?: IdentifierType): void;

  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer():ContainerInterface;
}

export abstract class ServiceContainerInterfaceResolver implements ServiceContainerInterface {
  readonly extensions: ExtensionStaticInterface[] = [];

  registerHooks(hooker: object, identifier?: IdentifierType): void {
    throw new Error();
  }

  getContainer():ContainerInterface {
    throw new Error();
  }
}
