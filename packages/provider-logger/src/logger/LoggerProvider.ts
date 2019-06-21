import { Container } from '@ilos/core';

import { LoggerProviderInterface } from './LoggerProviderInterface';
import { LogMessageType } from '../LogMessageType';
import { LoggerFormatterInterface } from '../formatter/LoggerFormatterInterface';
import { LoggerTransportInterface } from '../transport/LoggerTransportInterface';

/**
 * Logger provider
 * @export
 * @class LoggerProvider
 * @implements {LoggerProviderInterface}
 */
@Container.provider()
export class LoggerProvider implements LoggerProviderInterface {
  constructor(
    protected formatters: LoggerFormatterInterface[],
    protected transports: LoggerTransportInterface[],
  ) {
    //
  }

  async boot() {
    return;
  }
  protected formatMessage(message: LogMessageType): LogMessageType {
    let msg = message;
    for(const formatter of this.formatters) {
      msg = formatter.format(msg);
    }
    return msg;
  }

  protected async sendMessage(message: LogMessageType): Promise<void> {
    for (const transport of this.transports) {
      await transport.log(message);  
    }
  }

  protected createMessage(message: LogMessageType): LogMessageType {
    // append meta
    return message;
  }

  protected newMessage(message: LogMessageType):void {
    this.sendMessage(
      this.formatMessage(
        this.createMessage(message),
      ),
    ).catch(() => {
      // do nothing
    })
  }

  debug(message: string): void {
    this.newMessage({ message, level:'debug' });
  }
  info(message: string): void {
    this.newMessage({ message, level:'info' });
  }
  warn(message: string): void {
    this.newMessage({ message, level:'warn' });
  }
  error(message: string): void {
    this.newMessage({ message, level:'error' });
  }
  fatal(message: string): void {
    this.newMessage({ message, level:'fatal' });
  }
}
