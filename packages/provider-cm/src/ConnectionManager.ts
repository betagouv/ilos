import { Types, Interfaces, Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { ConnectionInterface, ConnectionConfigType } from './ConnectionInterface';

@Container.provider()
export class ConnectionManager {
  protected connectionRegistry: Map<Symbol, Map<Symbol, ConnectionInterface>> = new Map();
  protected connectionConstructorSymbols: Map<Types.NewableType<ConnectionInterface>, Symbol> = new Map();

  constructor(
    protected serviceContainer: Interfaces.ServiceContainerInterfaceResolver,
    protected config: ConfigProviderInterfaceResolver,
  ) {
    //
  }

  boot() {
    this.serviceContainer.registerShutdownHook(async () => this.shutdown());
  }

  registerConnectionRequest(
    constructor: Types.NewableType<any>,
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    connectionConfiguration: ConnectionConfigType
  ) {
    const container = this.serviceContainer.getContainer();
    const tokens = this.connectionRequest(connectionConstructor, connectionConfiguration);

    container
      .bind(connectionConstructor)
      .toDynamicValue((context) => this.getConnection(...tokens))
      .whenInjectedInto(constructor);
  }

  protected getConnection(constructorToken: Symbol, configurationToken: Symbol): ConnectionInterface {
    if (!(this.connectionRegistry.has(constructorToken))) {
      throw new Error('Unable to find connection');
    }
    const connectionRegistry = this.connectionRegistry.get(constructorToken);
    if (!(connectionRegistry.has(configurationToken))) {
      throw new Error('Unable to find connection');
    }
    return connectionRegistry.get(configurationToken);
  }

  protected connectionRequest(constructor: Types.NewableType<ConnectionInterface>, configuration: ConnectionConfigType): [Symbol, Symbol] {
    let config = {};

    if ('configKey' in configuration) {
      config = this.config.get(configuration.configKey, {});      
    }
    const [ constructorSymbol, configurationSymbol ] = this.getSymbols(
      constructor,
      ('shared' in configuration) ? configuration.shared : true,
      config,
    );

    this.setConnectionInRegistry(constructorSymbol, configurationSymbol, constructor, config);

    return [ constructorSymbol, configurationSymbol ];
  }

  protected setConnectionInRegistry(constructorSymbol: Symbol, configurationSymbol: Symbol, constructor, config) {
    if (!(this.connectionRegistry.has(constructorSymbol))) {
      this.connectionRegistry.set(constructorSymbol, new Map());
    }
    const connectionRegistry = this.connectionRegistry.get(constructorSymbol);
    if (!(connectionRegistry.has(configurationSymbol))) {
      connectionRegistry.set(configurationSymbol, new constructor(config));
    }
  }

  protected getSymbols(constructor: Types.NewableType<ConnectionInterface>, shared: boolean, configuration: object): [Symbol, Symbol] {
    if (!(this.connectionConstructorSymbols.has(constructor))) {
      this.connectionConstructorSymbols.set(constructor, Symbol());
    }

    const constructorSymbol = this.connectionConstructorSymbols.get(constructor);

    if (!shared) {
      return [constructorSymbol, Symbol()];
    }
    const configurationSymbol = Symbol.for(JSON.stringify(configuration));
    return [constructorSymbol, configurationSymbol];
  }
}
