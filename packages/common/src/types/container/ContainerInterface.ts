import { interfaces } from 'inversify';

import { NewableType } from '../shared';
import { HandlerInterface, HandlerConfigType } from '../handler';

export interface ContainerInterface extends interfaces.Container {
  root: ContainerInterface;
  setHandler(handler: NewableType<HandlerInterface>): void;
  getHandler(config: HandlerConfigType): HandlerInterface;
  getHandlers(): HandlerConfigType[];
  createChild(containerOptions?: interfaces.ContainerOptions): ContainerInterface;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Factory<T> extends interfaces.Factory<T> {}
