import {
  Container,
  ContainerInterface,
} from '../container';

import {
  ServiceContainerInterface,
  ServiceContainerConstructorInterface,
  ServiceContainerInterfaceResolver
} from '../interfaces/ServiceContainerInterface';

import { hasInterface } from '../helpers/types/hasInterface';
import { DestroyHookInterface } from '../interfaces/hooks/DestroyHookInterface';
import { InitHookInterface } from '../interfaces/hooks/InitHookInterface';
import { RegisterHookInterface } from '../interfaces/hooks/RegisterHookInterface';

/**
 * Service container parent class
 * @export
 * @abstract
 * @class ServiceContainer
 * @implements {ServiceContainerInterface}
 */
export abstract class ServiceContainer implements ServiceContainerInterface, InitHookInterface, DestroyHookInterface, RegisterHookInterface {
  readonly children: ServiceContainerConstructorInterface[] = [];
  readonly extensions: ServiceContainerConstructorInterface[] = [];

  protected registerHookRegistry: Set<RegisterHookInterface> = new Set();
  protected initHookRegistry: Set<InitHookInterface> = new Set();
  protected destroyHookRegistry: Set<DestroyHookInterface> = new Set();

  protected container: ContainerInterface;

  constructor(container?: ContainerInterface) {
    if (container) {
      this.container = container;
    } else {
      this.container = new Container();
      this.container.bind(ServiceContainerInterfaceResolver).toConstantValue(this);
    }
  }

  /**
   * Register hook add children and extension, then dispatch register
   * @memberof ServiceContainer
   */
  async register() {
    for (const extension of this.extensions) {
      this.registerHooks(extension, this.getContainer());
    }

    for (const child of this.children) {
      this.registerHooks(child, this.getContainer().createChild());
    }

    return this.dispatchRegisterHook();
  }

  async init() {
    return this.dispatchInitHook();
  }

  async destroy() {
    return this.dispatchDestroyHook();
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer():ContainerInterface {
    return this.container;
  }

  protected async dispatchRegisterHook() {
    for (const [hook] of this.registerHookRegistry.entries()) {
      await hook.register();
    }
    this.registerHookRegistry.clear();
  }

  protected async dispatchInitHook() {
    for (const [hook] of this.initHookRegistry.entries()) {
      await hook.init();
    }
    this.initHookRegistry.clear();
  }

  protected async dispatchDestroyHook() {
    const destroyHookRegistry = [...this.destroyHookRegistry].reverse();
    for (const hook of destroyHookRegistry) {
      await hook.destroy();
    }
    this.destroyHookRegistry.clear();
  }

  protected registerHooks(serviceContainerConstructor: ServiceContainerConstructorInterface, container: ContainerInterface): void {
    const serviceContainer = new serviceContainerConstructor(container);

    if (hasInterface<RegisterHookInterface>(serviceContainer, 'register')) {
      this.registerHookRegistry.add(serviceContainer);
    }

    if (hasInterface<InitHookInterface>(serviceContainer, 'init')) {
      this.initHookRegistry.add(serviceContainer);
    }

    if (hasInterface<DestroyHookInterface>(serviceContainer, 'destroy')) {
      this.destroyHookRegistry.add(serviceContainer);
    }

    return;
  }
}
