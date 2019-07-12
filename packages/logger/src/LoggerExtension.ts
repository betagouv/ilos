import * as winston from 'winston';

import {
  LoggerInterfaceResolver,
  ConfigInterfaceResolver,
  RegisterHookInterface,
  ServiceContainerInterface,
  extension,
} from '@ilos/common';

import { ConfigExtension } from '@ilos/config';

import { Logger } from './Logger';

@extension({
  name: 'logger',
  require: [
    ConfigExtension,
  ]
})
export class LoggerExtension implements RegisterHookInterface {
  constructor(protected configKey: string) {
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (!container.isBound(ConfigInterfaceResolver)) {
      throw new Error(`Unable to load config provider`);
    }

    if (!container.isBound(LoggerInterfaceResolver)) {
      container.bind(Logger)
        .toDynamicValue((context) => {
          const contextedContainer = context.container;
          if (!contextedContainer.isBound(ConfigInterfaceResolver)) {
            throw new Error(`Unable to load config provider`);
          }
          const config = contextedContainer.get(ConfigInterfaceResolver);
          return new Logger(winston.createLogger(
            config.get(this.configKey, {
              transports: [
                new winston.transports.Console(),
              ],
            }),
          ));
        });
    }
  }
}
