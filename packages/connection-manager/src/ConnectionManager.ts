import { Types, Interfaces, Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver, ConfigProviderInterface } from '@ilos/provider-config';
import { ConnectionDeclaration, ConnectionInterface, ConnectionConfigType } from './ConnectionManagerInterfaces';

export class ConnectionManager implements Interfaces.ServiceProviderInterface {
  readonly alias = [];
  readonly handlers = [];
  readonly serviceProviders = [];

  readonly connections: ConnectionDeclaration[] = [];

  protected config: ConfigProviderInterface;
  protected connectionRegistry: Map<Symbol, Map<Symbol, ConnectionInterface>> = new Map();
  protected connectionConstructorSymbols: Map<Types.NewableType<ConnectionInterface>, Symbol> = new Map();

  constructor(
    protected serviceContainer: Container.ContainerInterface
  ) {
    //
  }

  boot(): void {
    this.config = this.getContainer().get(ConfigProviderInterfaceResolver);
    for(const serviceConnectionDefinition of this.connections) {
      const [ serviceConstructor, serviceConnections] = serviceConnectionDefinition;
      for(const connection of serviceConnections) {
        const [ connectionConstructor, connectionConfig ] = connection;
        this.registerConnectionRequest(serviceConstructor, connectionConstructor, connectionConfig);
      }
    }
  }

  async shutdown(): Promise<void> {
    const connectionRegistry = this.connectionRegistry.entries();
    for(const [_symbol, connectionScopedRegistry] of connectionRegistry) {
      const connections = connectionScopedRegistry.entries();
      for(const [_symbol, connection] of connections) {
        try {
          await connection.down();
        } catch(e) {
          // do nothing
        }
      }
    }
  }

  getContainer():Container.ContainerInterface {
    return this.serviceContainer;
  }

  async registerServiceProvider(serviceProviderConstructor): Promise<void> {
    return;
  }

  registerShutdownHook(hook: Function) {
    //
  }

  protected registerConnectionRequest(
    constructor: Types.NewableType<any>,
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    connectionConfiguration: ConnectionConfigType
  ): void {
    const container = this.getContainer();
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
