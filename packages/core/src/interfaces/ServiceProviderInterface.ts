
import { ServiceContainerInterface } from './ServiceContainerInterface';
import { NewableType } from '../types/NewableType';
import { MiddlewareInterface } from './MiddlewareInterface';
import { HandlerInterface } from './HandlerInterface';

export interface ServiceProviderInterface extends ServiceContainerInterface {
  /**
   * Handlers array provided by this service provider
   * @type {NewableType<HandlerInterface>[]}
   * @memberof ServiceProviderInterface
   */
  readonly handlers: NewableType<HandlerInterface>[];

  /**
   * Middlewares is a shortcut to registrer middlewares
   * @example [['can', CanMiddleware]] will bind 'can' to CanMiddleware
   * @type {[string, NewableType<MiddlewareInterface>][]}
   * @memberof ServiceProviderInterface
   */
  readonly middlewares?: [string, NewableType<MiddlewareInterface>][];
}
