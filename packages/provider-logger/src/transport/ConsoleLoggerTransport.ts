import { LogMessageType } from "../LogMessageType";
import { LoggerTransportInterface } from "./LoggerTransportInterface";

export class ConsoleLoggerTransport implements LoggerTransportInterface {
  async log(message: LogMessageType): Promise<void> {
    const msg = message.message;
    switch(message.level) {
      case 'debug':
        console.debug(msg);
        break;
      case 'info':
        console.info(msg);
        break;
      case 'warn':
        console.warn(msg);
        break;
      case 'error':
        console.error(msg);
        break;
      case 'fatal':
        console.error(msg);
        break;
      default:
        console.log(msg);
        break;
    }
  }  
}
