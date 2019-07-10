import { Types } from '@ilos/core';

export interface ConnectionInterface<T= any> {
  up(): Promise<void>;
  down(): Promise<void>;
  getClient(): T;
}

export type ConnectionConfigurationType = {
  [key: string]: any,
};

export type ConnectionDeclarationType = {
  use: Types.NewableType<ConnectionInterface>,
  withConfig: string,
  inside?: Types.NewableType<any>[],
} | [Types.NewableType<ConnectionInterface>, string, Types.NewableType<any>[]?];
