import {
  ContainerInterface,
  ServiceContainerInterface,
  ServiceContainerInterfaceResolver,
  DestroyHookInterface,
  InitHookInterface,
  RegisterHookInterface,
  ExtensionInterface,
  ExtensionStaticInterface,
  IdentifierType,
  NewableType,
  FactoryType,
} from '@ilos/common';

import { Container, HookRegistry } from '../container';

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

  protected registerHookRegistry = new HookRegistry<RegisterHookInterface>('register', false);
  protected initHookRegistry = new HookRegistry<InitHookInterface>('init');
  protected destroyHookRegistry = new HookRegistry<DestroyHookInterface>('destroy');

  protected readonly container: ContainerInterface;
  protected readonly parent?: ServiceContainerInterface;

  constructor(container?: ContainerInterface) {
    this.container = (container) ? container.createChild() : new Container();
    this.container.bind(ServiceContainerInterfaceResolver).toConstantValue(this);
  }

  /**
   * Register hook add children and extension, then dispatch register
   * @memberof ServiceContainer
   */
  async register() {
    this.registerExtensions(this.extensions);
    this.applyExtensions();
    await this.registerChildren();
    await this.registerHookRegistry.dispatch(this);
  }

  async init() {
    await this.initHookRegistry.dispatch(this);
  }

  async destroy() {
    await this.destroyHookRegistry.dispatch(this);
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer(): ContainerInterface {
    return this.container;
  }


  public registerHooks(hooker: object, identifier?: IdentifierType): void {
    this.registerHookRegistry.register(hooker, identifier);
    this.initHookRegistry.register(hooker, identifier);
    this.destroyHookRegistry.register(hooker, identifier);
    return;
  }

  protected registerExtensions(extensions: ExtensionStaticInterface[]) {
    const container = this.getContainer().root;
    for (const index in extensions) {
      if (extensions.hasOwnProperty(index)) {
        const extension = extensions[index];
        const containerExtensionKey = `extension:${extension.key}`;
        if (!container.isBound(containerExtensionKey)) {
          container.bind(containerExtensionKey).toFactory(() => config => new extension(config));
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
        const extension = container.get<FactoryType<ExtensionInterface>>(extensionKey)(extensionConfig);
        this.registerHooks(extension);
      }
    }
  }

  protected registerChildren() {
    if (Reflect.hasMetadata('extension:children', this.constructor)) {
      const children = Reflect.getMetadata('extension:children', this.constructor);
      for (const child of children) {
        const childInstance = new child(this.getContainer());
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

  public get(identifier: IdentifierType) {
    return this.container.get(identifier);
  }

  public bind(ctor: NewableType<any>, identifier?: IdentifierType) {
    this.container.bind(ctor).toSelf();
    if (identifier) {
      this.container.bind(identifier).toService(ctor);
    }

    const taggedIdentifier = <IdentifierType | IdentifierType[]>Reflect.getMetadata('extension:identifier', ctor);
    if (taggedIdentifier) {
      if (!Array.isArray(taggedIdentifier)) {
        this.container.bind(taggedIdentifier).toService(ctor);
      } else {
        for (const id of taggedIdentifier) {
          this.container.bind(id).toService(ctor);
        }
      }
    }
  }

  public ensureIsBound(identifier: IdentifierType, fallback?: NewableType<any>) {
    if (this.container.isBound(identifier)) {
      return;
    }

    if (fallback) {
      this.bind(fallback, identifier);
      return;
    }

    const name = (typeof identifier === 'string') ?
      identifier : (typeof identifier === 'function') ?
      identifier.name : identifier.toString();
    throw new Error(`Unable to find bindings for ${name}`);
  }

  public overrideBinding(identifier: IdentifierType, ctor: NewableType<any>) {
    if (this.container.isBound(identifier)) {
      this.container.unbind(identifier);
    }

    this.bind(ctor, identifier);
  }
}
