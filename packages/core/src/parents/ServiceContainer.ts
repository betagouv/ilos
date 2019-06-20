import {
  ContainerModule,
  ContainerModuleConfigurator,
  Container,
  ContainerInterface,
  Bind,
  Unbind,
  IsBound,
  Rebind,
} from '../container';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';
import { ServiceContainerInterface } from '../interfaces/ServiceContainerInterface';

/**
 * Service container parent class
 * @export
 * @abstract
 * @class ServiceContainer
 * @implements {ServiceContainerInterface}
 */
export abstract class ServiceContainer implements ServiceContainerInterface {
  readonly alias: any[] = [];
  readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [];

  protected ready = false;
  protected container: ContainerInterface;

  constructor(container?: ContainerInterface) {
    this.container = new Container();
    if (container) {
      this.container.parent = container;
    }
  }

  /**
   * Boot register a container module provided by register function,
   * then register the handlers, then boot other service providers
   * @memberof ServiceProvider
   */
  public async boot() {
    if (this.ready) {
      return;
    }

    this.getContainer().load(
      new ContainerModule(
        (bind: Bind, unbind: Unbind, isBound: IsBound, rebind: Rebind) => {
          this.register({ bind, unbind, isBound, rebind });

        },
      ),
    );

    for (const serviceProviderConstructor of this.serviceProviders) {
      await this.registerServiceProvider(serviceProviderConstructor);
    }

    this.ready = true;
  }

  /**
   * Auto bind alias
   * @param {ContainerModuleConfigurator} module
   * @memberof ServiceProvider
   */
  public register(module: ContainerModuleConfigurator):void {
    this.alias.forEach((def) => {
      if (Array.isArray(def)) {
        const [alias, target] = def;
        module.bind(alias).to(target);
      } else {
        module.bind(def).toSelf();
      }
    });
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer():ContainerInterface {
    return this.container;
  }

  public async registerServiceProvider(serviceProviderConstructor: NewableType<ServiceProviderInterface>): Promise<void> {
    const serviceProvider = new serviceProviderConstructor(this.getContainer());
    await serviceProvider.boot();
  }
}