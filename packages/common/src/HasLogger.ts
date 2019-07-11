import { inject } from './Decorators';
import { LoggerInterface } from './types/logger';

export class HasLogger {
  @inject(Symbol.for('logger'))
  protected logger: LoggerInterface;
}
