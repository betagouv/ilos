/* tslint:disable:no-empty-interface */
import { interfaces } from 'inversify';

import { Types, Interfaces } from '..';

export type AnyConfig = {
  [k: string]: any,
};

export type HandlerConfig = {
  service?: string;
  method?: string;
  version?: string;
  local?: boolean;
  queue?: boolean;
  signature?: string;
  containerSignature?: string;
};

export type HandlerContainerConfig = HandlerConfig | AnyConfig;

export interface ContainerInterface extends interfaces.Container {
  root: ContainerInterface;
  setHandler(handler: Types.NewableType<Interfaces.HandlerInterface>): void;
  getHandler(config: HandlerConfig): Interfaces.HandlerInterface;
  getHandlers(): HandlerConfig[];
  createChild(containerOptions?: interfaces.ContainerOptions): ContainerInterface;
}

export interface Bind extends interfaces.Bind {}
export interface Unbind extends interfaces.Unbind {}
export interface IsBound extends interfaces.IsBound {}
export interface Rebind extends interfaces.Rebind {}

export interface ContainerModuleConfigurator {
  bind: Bind;
  unbind: Unbind;
  isBound: IsBound;
  rebind: Rebind;
}

export type ServiceIdentifier<T = any> = interfaces.ServiceIdentifier<T>;
export interface Factory<T> extends interfaces.Factory<T> {}
