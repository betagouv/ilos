import { Types } from '@ilos/core';

export interface ConnectionInterface<T=any> {
  up(): Promise<void>;
  down(): Promise<void>;
  getClient(): T;
}

export type ConnectionConfigurationType = {
  [key: string]: any,
};

export type ConnectionConfigType = {
  shared?: boolean,
  configKey?: string,
};

export type ConnectionDefinitionType = [Types.NewableType<ConnectionInterface>, ConnectionConfigType];
export type ConnectionDeclarationType = [any, ConnectionDefinitionType[]];
