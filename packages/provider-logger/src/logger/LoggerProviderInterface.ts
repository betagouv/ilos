import { Interfaces } from '@ilos/core';

export interface LoggerProviderInterface extends Interfaces.ProviderInterface {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
}

export abstract class LoggerProviderInterfaceResolver implements LoggerProviderInterface {
  async boot() {
    return;
  }
  debug(message: string): void {
    throw new Error();
  }
  info(message: string): void {
    throw new Error();
  }
  warn(message: string): void {
    throw new Error();
  }
  error(message: string): void {
    throw new Error();
  }
  fatal(message: string): void {
    throw new Error();
  }
}
