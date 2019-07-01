import { ContainerInterface } from '../container';
import { ServiceProviderInterface } from './ServiceProviderInterface';
import { NewableType } from '../types';

interface Newable<T> {
  new (...args: any[]): T;
}
interface Abstract<T> {
  prototype: T;
}
type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

export interface ServiceContainerConstructorInterface<T = any> {
  new (container?: ContainerInterface) : T;
}

export interface ServiceContainerInterface {
  readonly children: ServiceContainerConstructorInterface[];
  readonly extensions: ServiceContainerConstructorInterface[];

  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer():ContainerInterface;
}

export abstract class ServiceContainerInterfaceResolver implements ServiceContainerInterface {
  readonly children: ServiceContainerConstructorInterface[] = [];
  readonly extensions: ServiceContainerConstructorInterface[] = [];

  getContainer():ContainerInterface {
    throw new Error();
  }
}
