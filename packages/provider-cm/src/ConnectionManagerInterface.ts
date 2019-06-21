import { Types } from '@ilos/core';
import { ConnectionInterface } from './ConnectionInterface';

export type ConnectionConfigType = any;
export type ConnectionDefinition = [Types.NewableType<ConnectionInterface>, ConnectionConfigType];
export type ConnectionDeclaration = [any, ConnectionDefinition[]];
 
export interface ConnectionManagerProviderInterface {
  create(connection: Types.NewableType<ConnectionInterface>):ConnectionInterface;
  get(connection: Types.NewableType<ConnectionInterface>):ConnectionInterface;
}


