import * as winston from 'winston';

import {
  LoggerInterfaceResolver,
  ConfigInterfaceResolver,
  RegisterHookInterface,
  ServiceContainerInterface,
  extension,
  CONTAINER_LOGGER_KEY,
} from '@ilos/common';

import {
  LoggerConfigurationType,
  loggerDefaultConfiguration,
  buildLoggerConfiguration,
} from './loggerDefaultConfiguration';

@extension({
  name: 'logger',
  autoload: true,
})
export class LoggerExtension implements RegisterHookInterface {
  constructor(protected config: LoggerConfigurationType = loggerDefaultConfiguration) {}

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const env =
      'APP_ENV' in process.env ? process.env.APP_ENV : 'NODE_ENV' in process.env ? process.env.NODE_ENV : 'default';

    if (!container.isBound(LoggerInterfaceResolver)) {
      container.bind(LoggerInterfaceResolver).toDynamicValue((context) => {
        const contextedContainer = context.container;
        if (!contextedContainer.isBound(ConfigInterfaceResolver)) {
          throw new Error(`Unable to load config provider`);
        }
        return winston.createLogger(buildLoggerConfiguration(this.config, env));
      });

      if (container.isBound(CONTAINER_LOGGER_KEY)) {
        container.unbind(CONTAINER_LOGGER_KEY);
      }
      container.bind(CONTAINER_LOGGER_KEY).toService(LoggerInterfaceResolver);
    }
  }
}
