import { Container } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import * as winston from 'winston';

import { LoggerInterface } from './LoggerInterface';
import { LogMessageType } from './LogMessageType';

/**
 * Logger provider
 * @export
 * @class Logger
 * @implements {LoggerInterface}
 */
@Container.provider()
export class Logger implements LoggerInterface {
  protected winston: winston.Logger;

  constructor(
    protected config: ConfigInterfaceResolver,
  ) {
    //
  }

  async boot() {
    this.winston = winston.createLogger(
      this.config.get('logger.winston', {}),
    );
  }

  log(msg: LogMessageType): void {
    const { level, message, meta } = msg;
    this.winston.log(level, message, meta);  
  }

  debug(message: string, meta?: any): void {
    this.log({ message, meta, level:'debug' });
  }
  info(message: string, meta?: any): void {
    this.log({ message, meta, level:'info' });
  }
  warn(message: string, meta?: any): void {
    this.log({ message, meta, level:'warn' });
  }
  error(message: string, meta?: any): void {
    this.log({ message, meta, level:'error' });
  }
  fatal(message: string, meta?: any): void {
    this.log({ message, meta, level:'fatal' });
  }
}
