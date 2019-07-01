import { Interfaces } from '@ilos/core';
import { LogMessageType } from './LogMessageType';

export interface LoggerInterface extends Interfaces.ProviderInterface {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  fatal(message: string, meta?: any): void;
  log(message: LogMessageType): void;
}

export abstract class LoggerInterfaceResolver implements LoggerInterface {
  async boot() {
    return;
  }
  debug(message: string, meta?: any): void {
    throw new Error();
  }
  info(message: string, meta?: any): void {
    throw new Error();
  }
  warn(message: string, meta?: any): void {
    throw new Error();
  }
  error(message: string, meta?: any): void {
    throw new Error();
  }
  fatal(message: string, meta?: any): void {
    throw new Error();
  }
  log(message: LogMessageType): void {
    throw new Error();
  }
}
