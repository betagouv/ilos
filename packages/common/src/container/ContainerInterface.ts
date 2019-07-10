/* tslint:disable:no-empty-interface */
import { interfaces } from 'inversify';

export interface ContainerInterface extends interfaces.Container {
  root: ContainerInterface;
}

export interface Factory<T> extends interfaces.Factory<T> {}
