import { Types, Interfaces, Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver, ConfigProviderInterface } from '@ilos/provider-config';
import { ConnectionDeclarationType, ConnectionInterface, ConnectionConfigurationType } from './ConnectionManagerInterfaces';

export class ConnectionManager implements Interfaces.ServiceProviderInterface {
  readonly alias = [];
  readonly handlers = [];
  readonly serviceProviders = [];

  readonly connections: ConnectionDeclarationType[] = [];

  protected config: ConfigProviderInterface;
  protected connectionRegistry: Map<Symbol, Map<Symbol, ConnectionInterface>> = new Map();

  /* Register maps */
  protected connectionConstructorSymbols: Map<Types.NewableType<ConnectionInterface>, Symbol> = new Map();
  protected connectionMappingRegistry: Map<Types.NewableType<ConnectionInterface>, Map<Types.NewableType<any>, Symbol>> = new Map();

  constructor(
    protected serviceContainer: Container.ContainerInterface
  ) {
    //
  }

  async boot(): Promise<void> {
    this.config = this.getContainer().get(ConfigProviderInterfaceResolver);
    for(const serviceConnectionDeclaration of this.connections) {
      if (Array.isArray(serviceConnectionDeclaration)) {
        const [connectionConstructor, connectionConfig, serviceConstructors] = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfig, serviceConstructors);
      } else {
        const { use: connectionConstructor, withConfig: connectionConfig, inside: serviceConstructors } = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfig, serviceConstructors);
      }
    }
    this.setUpContainer();
    await this.bootConnections();
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

  async bootConnections(): Promise<void> {
    const connectionRegistry = this.connectionRegistry.entries();
    for(const [_symbol, connectionScopedRegistry] of connectionRegistry) {
      const connections = connectionScopedRegistry.entries();
      for(const [_symbol, connection] of connections) {
        try {
          await connection.up();
        } catch(e) {
          throw e;
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

  protected setUpContainer() {
    const connectionMappingRegistry = this.connectionMappingRegistry.entries();
    const container = this.getContainer();
    for (const [ connectionConstructor, connectionMapRegistry] of connectionMappingRegistry) {
      const connectionSymbol = this.connectionConstructorSymbols.get(connectionConstructor);

      const connectionMap = connectionMapRegistry.entries();
      for (const [ constructor, constructorSymbol] of connectionMap) {
        container
        .bind(connectionConstructor)
        .toConstantValue(
          this.getConnection(connectionSymbol, constructorSymbol),
        )
        .whenInjectedInto(constructor);
      }

      const fallbackSymbol = Symbol.for('default');
      let fallback;
      try {
        fallback = this.getConnection(connectionSymbol, fallbackSymbol);
      } catch {
        // do nothings
      }

      if (fallback) {
        container
          .bind(connectionConstructor)
          .toConstantValue(fallback)
          .when((request) => {
            const parentRequest = request.parentRequest;
            if (parentRequest !== null) {
              const binding = parentRequest.bindings[0];
              if (binding) {
                const constructor = parentRequest.bindings[0].implementationType;
                return !(connectionMapRegistry.has(constructor));
              }
              return true;
            }
            return true;
          });
      }
    }
  }

  protected registerConnectionRequest(
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    connectionConfigurationKey: string,
    constructors?: Types.NewableType<any>[],
  ): void {
    const configurationToken = this.connectionRequest(
      connectionConstructor,
      this.getConfig(connectionConfigurationKey),
      constructors ? false : true,
    );
    
    if (!(this.connectionMappingRegistry.has(connectionConstructor))) {
      this.connectionMappingRegistry.set(connectionConstructor, new Map());
    }

    const connectionMapping = this.connectionMappingRegistry.get(connectionConstructor);
    
    if (constructors) {
      for (const constructor of constructors) {
        if (!(connectionMapping.has(constructor))) {
          connectionMapping.set(constructor, configurationToken);
        }
      }
    }
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

  protected connectionRequest(constructor: Types.NewableType<ConnectionInterface>, configuration: ConnectionConfigurationType, fallback = false): Symbol {
    const constructorSymbol = this.getConnectionConstructorSymbol(constructor);
    const configurationSymbol = fallback ? Symbol.for('default') : Symbol();

    this.setConnectionInRegistry(constructorSymbol, configurationSymbol, constructor, configuration);

    return configurationSymbol;
  }

  protected setConnectionInRegistry(
    constructorSymbol: Symbol,
    configurationSymbol: Symbol,
    constructor: Types.NewableType<ConnectionInterface>,
    configuration: ConnectionConfigurationType,
  ) {
    if (!(this.connectionRegistry.has(constructorSymbol))) {
      this.connectionRegistry.set(constructorSymbol, new Map());
    }
    const connectionRegistry = this.connectionRegistry.get(constructorSymbol);
    if (!(connectionRegistry.has(configurationSymbol))) {
      connectionRegistry.set(configurationSymbol, new constructor(configuration));
    }
  }

  protected getConfig(configurationKey: string): ConnectionConfigurationType {
    return this.config.get(configurationKey, {});
  }

  protected getConnectionConstructorSymbol(constructor: Types.NewableType<ConnectionInterface>): Symbol {
    if (!(this.connectionConstructorSymbols.has(constructor))) {
      this.connectionConstructorSymbols.set(constructor, Symbol());
    }
    return this.connectionConstructorSymbols.get(constructor);
  }
}
