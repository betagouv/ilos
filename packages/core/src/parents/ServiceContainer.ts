import { Container, ContainerInterface, Factory } from '../container';

import {
  ServiceContainerInterface,
  ServiceContainerInterfaceResolver,
  StatusType,
  BEFORE_CONSTRUCT,
  AFTER_CONSTRUCT,
  BEFORE_REGISTER,
  AFTER_REGISTER,
  BEFORE_INIT,
  AFTER_INIT,
  BEFORE_DESTROY,
  AFTER_DESTROY,
} from '../interfaces/ServiceContainerInterface';

import { hasInterface } from '../helpers/types/hasInterface';

import { DestroyHookInterface, InitHookInterface, RegisterHookInterface, HookInterface } from '../interfaces/hooks';

import { ExtensionInterface, ExtensionStaticInterface } from '../interfaces/ExtentionInterface';
import { IdentifierType } from '../types';

/**
 * Service container parent class
 * @export
 * @abstract
 * @class ServiceContainer
 * @implements {ServiceContainerInterface}
 */
export abstract class ServiceContainer
  implements ServiceContainerInterface, InitHookInterface, DestroyHookInterface, RegisterHookInterface {
  readonly extensions: ExtensionStaticInterface[] = [];
  protected status: StatusType = BEFORE_CONSTRUCT;

  protected registerHookRegistry: Set<HookInterface> = new Set();
  protected initHookRegistry: Set<HookInterface> = new Set();
  protected destroyHookRegistry: Set<HookInterface> = new Set();

  protected container: ContainerInterface;

  constructor(container?: ContainerInterface) {
    if (container) {
      this.container = container;
    } else {
      this.container = new Container();
      this.container.bind(ServiceContainerInterfaceResolver).toConstantValue(this);
    }
    this.status = AFTER_CONSTRUCT;
  }

  /**
   * Register hook add children and extension, then dispatch register
   * @memberof ServiceContainer
   */
  async register() {
    this.registerExtensions(this.extensions);
    this.applyExtensions();

    await this.registerChildren();

    this.status = BEFORE_REGISTER;
    await this.dispatchRegisterHook();
    this.status = AFTER_REGISTER;
  }

  async init() {
    this.status = BEFORE_INIT;
    await this.dispatchInitHook();
    this.status = AFTER_INIT;
  }

  async destroy() {
    this.status = BEFORE_DESTROY;
    await this.dispatchDestroyHook();
    this.status = AFTER_DESTROY;
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer(): ContainerInterface {
    return this.container;
  }

  protected async dispatchRegisterHook() {
    for (const [hook] of this.registerHookRegistry.entries()) {
      await hook(this);
    }
    this.registerHookRegistry.clear();
  }

  protected async dispatchInitHook() {
    for (const [hook] of this.initHookRegistry.entries()) {
      await hook(this);
    }
    this.initHookRegistry.clear();
  }

  protected async dispatchDestroyHook() {
    const destroyHookRegistry = [...this.destroyHookRegistry].reverse();
    for (const hook of destroyHookRegistry) {
      await hook(this);
    }
    this.destroyHookRegistry.clear();
  }

  protected addRegisterHook(hook: HookInterface) {
    if (this.status < BEFORE_REGISTER) {
      this.registerHookRegistry.add(hook);
    }
  }

  protected addInitHook(hook: HookInterface) {
    if (this.status < BEFORE_INIT) {
      this.initHookRegistry.add(hook);
    }
  }

  protected addDestroyHook(hook: HookInterface) {
    if (this.status < BEFORE_DESTROY) {
      this.destroyHookRegistry.add(hook);
    }
  }

  public registerHooks(hooker: object, identifier?: IdentifierType): void {
    if (hasInterface<RegisterHookInterface>(hooker, 'register') && !identifier) {
      this.addRegisterHook(async (container) => hooker.register(container));
    }

    if (hasInterface<InitHookInterface>(hooker, 'init')) {
      let hook = async (container: ServiceContainerInterface) => hooker.init(container);
      if (identifier) {
        hook = async (container: ServiceContainerInterface) =>
          container
            .getContainer()
            .get<InitHookInterface>(identifier)
            .init(container);
      }
      this.addInitHook(hook);
    }

    if (hasInterface<DestroyHookInterface>(hooker, 'destroy')) {
      let hook = async (container: ServiceContainerInterface) => hooker.destroy(container);
      if (identifier) {
        hook = async (container: ServiceContainerInterface) =>
          container
            .getContainer()
            .get<DestroyHookInterface>(identifier)
            .destroy(container);
      }
      this.addDestroyHook(hook);
    }

    return;
  }

  protected registerExtensions(extensions: ExtensionStaticInterface[]) {
    const container = this.getContainer().root;
    for (const index in extensions) {
      if (extensions.hasOwnProperty(index)) {
        const extension = extensions[index];
        const containerExtensionKey = `extension:${extension.key}`;
        if (!container.isBound(containerExtensionKey)) {
          container.bind(containerExtensionKey).toFactory(() => (config) => new extension(config));
          container.bind('extensions').toConstantValue({
            index,
            key: containerExtensionKey,
          });
        }
      }
    }
  }

  protected applyExtensions() {
    const container = this.getContainer();
    const extensions = container.getAll<{ key: string; index: number }>('extensions').sort((a, b) => a.index - b.index);
    for (const { key: extensionKey } of extensions) {
      if (Reflect.hasMetadata(extensionKey, this.constructor)) {
        const extensionConfig = Reflect.getMetadata(extensionKey, this.constructor);
        const extension = container.get<Factory<ExtensionInterface>>(extensionKey)(extensionConfig);
        this.registerHooks(extension);
      }
    }
  }

  protected registerChildren() {
    if (Reflect.hasMetadata('extension:children', this.constructor)) {
      const children = Reflect.getMetadata('extension:children', this.constructor);
      for (const child of children) {
        const childInstance = new child(this.getContainer().createChild());
        this.getContainer()
          .bind(child)
          .toConstantValue(childInstance);
        this.getContainer()
          .bind('children')
          .toConstantValue(child);
        this.registerHooks(childInstance);
      }
    }
  }
}
