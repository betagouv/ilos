import { inject } from './Decorators';
import { LoggerInterface } from './logger';

export class HasLogger {
  @inject(Symbol.for('logger'))
  protected logger: LoggerInterface;
}
