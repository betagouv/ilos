import { LogMessageType } from "../LogMessageType";

export interface LoggerFormatterInterface {
  format(message: LogMessageType): LogMessageType;
}
