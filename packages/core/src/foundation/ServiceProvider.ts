import { ExtensionStaticInterface } from '@ilos/common';

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
  readonly extensions: ExtensionStaticInterface[] = [
    Middlewares,
    Providers,
    Handlers,
  ];
}
