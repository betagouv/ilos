export interface ConnectionInterface<T=any> {
  up(): Promise<void>;
  down(): Promise<void>;
  getClient(): T;
}

export type ConnectionConfigType = {
  shared?: boolean,
  configKey?: string,
};
