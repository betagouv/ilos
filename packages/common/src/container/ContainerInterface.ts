/* tslint:disable:no-empty-interface */
import { interfaces } from 'inversify';
import {
  NewableType,
  HandlerInterface,
  HandlerConfigType,
} from '../';

export interface ContainerInterface extends interfaces.Container {
  root: ContainerInterface;
  setHandler(handler: NewableType<HandlerInterface>): void;
  getHandler(config: HandlerConfigType): HandlerInterface;
  getHandlers(): HandlerConfigType[];
  createChild(containerOptions?: interfaces.ContainerOptions): ContainerInterface;
}

export interface Factory<T> extends interfaces.Factory<T> {}
