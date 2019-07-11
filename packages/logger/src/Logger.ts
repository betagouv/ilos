import { Container } from '@ilos/core';

import { LoggerInterface, LoggerDriverInterface, LogMessageType } from '@ilos/common';

/**
 * Logger provider
 * @export
 * @class Logger
 * @implements {LoggerInterface}
 */
@Container.provider()
export class Logger implements LoggerInterface {
  constructor(
    protected logger: LoggerDriverInterface,
  ) {
    //
  }

  log(msg: LogMessageType): void {
    const { level, message, meta } = msg;
    this.logger.log(level, message, meta);
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
