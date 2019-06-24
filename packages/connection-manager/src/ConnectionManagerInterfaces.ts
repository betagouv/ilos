import { Types } from '@ilos/core';

export interface ConnectionInterface<T=any> {
  up(): Promise<void>;
  down(): Promise<void>;
  getClient(): T;
}

export type ConnectionConfigType = {
  shared?: boolean,
  configKey?: string,
};

export type ConnectionDefinition = [Types.NewableType<ConnectionInterface>, ConnectionConfigType];
export type ConnectionDeclaration = [any, ConnectionDefinition[]];
