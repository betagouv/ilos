import { LogMessageType } from "../LogMessageType";
import { LoggerFormatterInterface } from "./LoggerFormatterInterface";

export class LoggerFormatter implements LoggerFormatterInterface {
  format(message: LogMessageType): LogMessageType {
    message.message = `${message.level} - ${message.message}`;
    return message;
  }  
}
