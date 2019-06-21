import { LogMessageType } from "../LogMessageType";

export interface LoggerTransportInterface {
  log(message: LogMessageType): Promise<void>;
}

