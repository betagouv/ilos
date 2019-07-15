import { expect } from 'chai';
import {
  injectable,
  extension,
  serviceProvider,
  extensionConfigurationMetadataKey,
  InitHookInterface,
  ServiceContainerInterface,
  ExtensionInterface,
  NewableType,
} from '@ilos/common';

import { ExtensionRegistry } from './ExtensionRegistry';
import { ServiceContainer } from '../foundation/ServiceContainer';

@injectable()
class Registry {
  public db: Set<{ config: any; data: any }> = new Set();
}

function createExtensionRegistry(
  extensions: NewableType<ExtensionInterface>[],
  config,
): [ExtensionRegistry, ServiceContainerInterface & InitHookInterface] {
  @serviceProvider(config)
  class CustomServiceContainer extends ServiceContainer {}

  const sp = new CustomServiceContainer();
  const er = new ExtensionRegistry(sp);
  for (const ext of extensions) {
    er.register(ext);
  }
  return [er, sp];
}

function createExtension(config): NewableType<ExtensionInterface> {
  @extension(config)
  class CustomExtension {
    constructor(public data) {
      //
    }
    init(serviceContainer: ServiceContainerInterface) {
      const registry = serviceContainer.get<Registry>('registry');
      registry.db.add({
        config: Reflect.getMetadata(extensionConfigurationMetadataKey, this.constructor),
        data: this.data,
      });
    }
  }
  return CustomExtension;
}

describe('Extension registry', () => {
  it('register extension', async () => {
    const extension1 = createExtension({
      name: 'hello',
    });

    const extension2 = createExtension({
      name: 'world',
    });

    const [extensionRegistry] = createExtensionRegistry([extension1, extension2], {});
    const extensions = extensionRegistry.all();
    expect(extensions).to.be.an('array');
    expect(extensions.length).to.eq(2);
  });

  it('override extension', async () => {
    const extension2 = createExtension({
      name: 'world',
    });

    const extension2bis = createExtension({
      name: 'world',
      autoload: true,
      override: true,
    });

    const [extensionRegistry] = createExtensionRegistry([extension2, extension2bis], {});
    const extensions = extensionRegistry.all();
    expect(extensions).to.be.an('array');
    expect(extensions.length).to.eq(1);
    expect(extensions[0].autoload).to.be.eq(true);
  });

  it('get appliable', async () => {
    const extension1 = createExtension({
      name: 'hello',
    });

    const extension2 = createExtension({
      name: 'world',
    });

    const extension2bis = createExtension({
      name: 'world',
      autoload: true,
      override: true,
    });

    const [extensionRegistry] = createExtensionRegistry([extension1, extension2, extension2bis], {
      hello: true,
    });

    const extensions = extensionRegistry.get();
    expect(extensions).to.be.an('array');
    expect(extensions.length).to.eq(2);
    expect(extensions.find((cfg) => cfg.name === 'world').autoload).to.be.eq(true);
  });

  it('get ordered', async () => {
    const extension1 = createExtension({
      name: 'hello',
    });

    const extension2 = createExtension({
      name: 'world',
    });

    const extension2bis = createExtension({
      name: 'world',
      autoload: true,
      override: true,
      require: [extension1],
    });

    const [extensionRegistry] = createExtensionRegistry([extension2, extension1, extension2bis], {
      hello: true,
    });

    const extensions = extensionRegistry.get();
    expect(extensions).to.be.an('array');
    expect(extensions.length).to.eq(2);
    expect(extensions[0].name).to.eq('hello');
    expect(extensions[1].name).to.eq('world');
  });

  it('get complex ordered', async () => {
    const ext6 = createExtension({
      name: 'six',
      autoload: true,
    });
    const ext5 = createExtension({
      name: 'five',
      autoload: true,
      require: [ext6],
    });
    const ext1 = createExtension({
      name: 'one',
      autoload: true,
      require: [ext5, ext6],
    });
    const ext2 = createExtension({
      name: 'two',
      autoload: true,
      require: [ext1],
    });
    const ext4 = createExtension({
      name: 'four',
      autoload: true,
      require: [ext2],
    });
    const ext3 = createExtension({
      name: 'three',
      autoload: true,
      require: [ext4],
    });

    const [extensionRegistry] = createExtensionRegistry([ext1, ext2, ext3, ext4, ext5, ext6], {
      hello: true,
    });

    const extensions = extensionRegistry.get();
    expect(extensions).to.be.an('array');
    expect(extensions.length).to.eq(6);
    expect(extensions[0].name).to.eq('six');
    expect(extensions[1].name).to.eq('five');
    expect(extensions[2].name).to.eq('one');
    expect(extensions[3].name).to.eq('two');
    expect(extensions[4].name).to.eq('four');
    expect(extensions[5].name).to.eq('three');
  });

  it('apply extension', async () => {
    const extension1 = createExtension({
      name: 'hello',
    });

    const extension2 = createExtension({
      name: 'world',
    });

    const extension2bis = createExtension({
      name: 'world',
      autoload: true,
      override: true,
      require: [extension1],
    });

    const [extensionRegistry, serviceProvider] = createExtensionRegistry([extension2, extension1, extension2bis], {
      hello: true,
    });

    extensionRegistry.apply();
    serviceProvider.bind(Registry, 'registry');
    await serviceProvider.init();
    const registry = [...serviceProvider.get<Registry>('registry').db];
    expect(registry).to.be.an('array');
    expect(registry.length).to.eq(2);
    expect(registry[0].config.name).to.be.eq('hello');
    expect(registry[0].data).to.be.eq(true);
    expect(registry[1].config.name).to.be.eq('world');
    expect(registry[1].data).to.be.eq(undefined);
  });
});
