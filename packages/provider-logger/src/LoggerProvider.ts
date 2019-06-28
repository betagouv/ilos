import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import * as winston from 'winston';

import { LoggerProviderInterface } from './LoggerProviderInterface';
import { LogMessageType } from './LogMessageType';

/**
 * Logger provider
 * @export
 * @class LoggerProvider
 * @implements {LoggerProviderInterface}
 */
@Container.provider()
export class LoggerProvider implements LoggerProviderInterface {
  protected winston: winston.Logger;

  constructor(
    protected config: ConfigProviderInterfaceResolver,
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
