import * as winston from 'winston';

import {
  LoggerInterfaceResolver,
  ConfigInterfaceResolver,
  RegisterHookInterface,
  ServiceContainerInterface,
} from '@ilos/common';

import { Logger } from './Logger';

export class LoggerExtension implements RegisterHookInterface {
  static readonly key: string = 'logger';

  constructor(protected configKey: string) {
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const config = container.get(ConfigInterfaceResolver);
    if (!container.isBound(LoggerInterfaceResolver)) {
      container
        .bind(LoggerInterfaceResolver)
        .toConstantValue(
          new Logger(winston.createLogger(
            config.get(this.configKey, {
              transports: [
                new winston.transports.Console(),
              ],
            }),
          )),
        );
    }
  }
}
