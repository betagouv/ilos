import { ServiceContainer } from './ServiceContainer';
import { ExtensionStaticInterface } from '../interfaces/ExtentionInterface';
import { Providers, Middlewares, Handlers } from '../extensions';

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider extends ServiceContainer {
  readonly extensions: ExtensionStaticInterface[] = [
    Middlewares,
    Providers,
    Handlers,
  ];
}
