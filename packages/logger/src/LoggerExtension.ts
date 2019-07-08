import * as winston from 'winston';
import { Interfaces } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { Logger } from './Logger';
import { LoggerInterfaceResolver } from './LoggerInterface';

export class LoggerExtension implements Interfaces.RegisterHookInterface {
  static readonly key: string = 'logger';

  constructor(protected configKey: string) {
  }
  
  async register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    const config = container.get(ConfigInterfaceResolver);
    if(!container.isBound(LoggerInterfaceResolver)) {
      container
        .bind(LoggerInterfaceResolver)
        .toConstantValue(
          new Logger(winston.createLogger(
            config.get(this.configKey, {
              transports: [
                new winston.transports.Console(),
              ],
            }),
          ))
        );
    }
  }
}
