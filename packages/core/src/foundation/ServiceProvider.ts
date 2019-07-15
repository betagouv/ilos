import { NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceContainer } from './ServiceContainer';
import { Providers, Middlewares, Handlers } from '../extensions';

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider extends ServiceContainer {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    Middlewares,
    Providers,
    Handlers,
  ];
}
