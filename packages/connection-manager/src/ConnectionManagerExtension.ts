import { Types, Interfaces, Container } from '@ilos/core';
import { ConfigInterfaceResolver, ConfigInterface } from '@ilos/config';

import {
  ConnectionDeclarationType,
  ConnectionInterface,
  ConnectionConfigurationType,
} from './ConnectionManagerInterfaces';

export class ConnectionManagerExtension
  implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface, Interfaces.DestroyHookInterface {
  static readonly key = 'connections';

  protected config: ConfigInterface;
  protected connectionRegistry: Map<Symbol, ConnectionInterface> = new Map();

  /**
   * instanceSymbolRegistry, map used for registring, associate a symbol with a config key
   * @protected
   * @type {Map<Symbol, string>}
   * @memberof ConnectionManagerExtension
   */
  protected instanceSymbolRegistry: Map<Symbol, string> = new Map();

  /**
   * connectionConstructorSymbolRegistry, map used for registring, associate a Connection constructor with a Symbol
   * @protected
   * @type {Map<Types.NewableType<ConnectionInterface>, Symbol>}
   * @memberof ConnectionManagerExtension
   */
  protected connectionConstructorSymbolRegistry: Map<Types.NewableType<ConnectionInterface>, Symbol> = new Map();

  /**
   * mappingRegistry, Map<Types.NewableType<ConnectionInterface>, Map<Types.NewableType<any>, instanceSymbolRegistry>>
   * @protected
   * @type {Map<Types.NewableType<ConnectionInterface>, Symbol>}
   * @memberof ConnectionManagerExtension
   */
  protected mappingRegistry: Map<
    Types.NewableType<ConnectionInterface>,
    Map<Types.NewableType<any>, Symbol>
  > = new Map();

  constructor(protected readonly connections: ConnectionDeclarationType[]) {}

  async register(serviceContainer: Interfaces.ServiceContainerInterface): Promise<void> {
    for (const serviceConnectionDeclaration of this.connections) {
      if (Array.isArray(serviceConnectionDeclaration)) {
        const [connectionConstructor, connectionConfigKey, serviceConstructors] = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfigKey, serviceConstructors);
      } else {
        const {
          use: connectionConstructor,
          withConfig: connectionConfigKey,
          inside: serviceConstructors,
        } = serviceConnectionDeclaration;
        this.registerConnectionRequest(connectionConstructor, connectionConfigKey, serviceConstructors);
      }
    }

    this.setUpContainer(serviceContainer.getContainer());
  }

  async init(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    this.config = container.get(ConfigInterfaceResolver);
    const connections = this.createAllConnections();

    for (const connection of connections) {
      await connection.up();
    }
  }

  async destroy(): Promise<void> {
    const connectionRegistry = this.connectionRegistry.entries();
    for (const [_symbol, connection] of connectionRegistry) {
      try {
        await connection.down();
      } catch (e) {
        // do nothing
      }
    }
  }

  protected setUpContainer(container: Container.ContainerInterface) {
    const connectionConstructorRegistry = this.connectionConstructorSymbolRegistry.entries();
    for (const [connectionConstructor, connectionSymbol] of connectionConstructorRegistry) {
      let requesterMapRegistry = new Map();
      if (this.mappingRegistry.has(connectionConstructor)) {
        requesterMapRegistry = this.mappingRegistry.get(connectionConstructor);

        const connectionMap = requesterMapRegistry.entries();
        for (const [requesterConstructor, instanceSymbol] of connectionMap) {
          container
            .bind(connectionConstructor)
            .toDynamicValue(() => this.getConnection(instanceSymbol, connectionConstructor))
            .whenInjectedInto(requesterConstructor);
        }
      }

      if (this.instanceSymbolRegistry.has(connectionSymbol)) {
        container
          .bind(connectionConstructor)
          .toDynamicValue(() => this.getConnection(connectionSymbol, connectionConstructor))
          .when((request) => {
            const parentRequest = request.parentRequest;
            if (parentRequest === null) {
              return true;
            }
            const binding = parentRequest.bindings[0];
            if (!binding) {
              return true;
            }
            const constructor = parentRequest.bindings[0].implementationType;
            return !requesterMapRegistry.has(constructor);
          });
      }
    }
  }

  protected registerConnectionRequest(
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    connectionConfigKey: string,
    serviceConstructors: Types.NewableType<any>[] = [],
  ): void {
    const connectionConstructorSymbol = this.getConnectionConstructorSymbol(connectionConstructor);
    const instanceSymbol = this.getInstanceSymbol(
      connectionConfigKey,
      serviceConstructors.length === 0 ? connectionConstructorSymbol : undefined,
    );

    if (serviceConstructors.length > 0) {
      this.setConstructorsMapping(serviceConstructors, connectionConstructor, instanceSymbol);
    }
  }

  protected createAllConnections(): ConnectionInterface[] {
    const connections: ConnectionInterface[] = [];
    const connectionConstructorRegistry = this.connectionConstructorSymbolRegistry.entries();

    for (const [connectionConstructor, connectionSymbol] of connectionConstructorRegistry) {
      if (this.mappingRegistry.has(connectionConstructor)) {
        const requesterMapRegistry = this.mappingRegistry.get(connectionConstructor);

        const connectionMap = requesterMapRegistry.entries();
        for (const [_requesterConstructor, instanceSymbol] of connectionMap) {
          connections.push(this.getConnection(instanceSymbol, connectionConstructor));
        }
      }

      if (this.instanceSymbolRegistry.has(connectionSymbol)) {
        connections.push(this.getConnection(connectionSymbol, connectionConstructor));
      }
    }
    return connections;
  }

  protected getConnection(
    instanceToken: Symbol,
    connectionConstructor: Types.NewableType<ConnectionInterface>,
  ): ConnectionInterface {
    if (!this.connectionRegistry.has(instanceToken)) {
      if (!this.instanceSymbolRegistry.has(instanceToken)) {
        throw new Error('Unable to find connection');
      }
      this.createConnection(connectionConstructor, this.instanceSymbolRegistry.get(instanceToken), instanceToken);
    }
    return this.connectionRegistry.get(instanceToken);
  }

  protected createConnection(
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    configKey: string | { [k: string]: any },
    instanceToken?: Symbol,
  ): ConnectionInterface {
    const config = typeof configKey === 'string' ? this.getConfig(configKey) : configKey;
    const connection = new connectionConstructor(config);

    if (instanceToken) {
      this.connectionRegistry.set(instanceToken, connection);
    }

    return connection;
  }

  protected getConfig(configurationKey: string): ConnectionConfigurationType {
    return this.config.get(configurationKey, {});
  }

  protected getConnectionConstructorSymbol(connConstructor: Types.NewableType<ConnectionInterface>): Symbol {
    if (!this.connectionConstructorSymbolRegistry.has(connConstructor)) {
      this.connectionConstructorSymbolRegistry.set(connConstructor, Symbol());
    }
    return this.connectionConstructorSymbolRegistry.get(connConstructor);
  }

  protected getInstanceSymbol(configurationKey: string, fallback?: Symbol): Symbol {
    let instanceSymbol: Symbol = Symbol();

    if (fallback) {
      instanceSymbol = fallback;
    }

    if (!this.instanceSymbolRegistry.has(instanceSymbol)) {
      this.instanceSymbolRegistry.set(instanceSymbol, configurationKey);
    }
    return instanceSymbol;
  }

  protected setConstructorsMapping(
    serviceConstructors: Types.NewableType<any>[],
    connectionConstructor: Types.NewableType<ConnectionInterface>,
    instanceSymbol: Symbol,
  ) {
    if (!this.mappingRegistry.has(connectionConstructor)) {
      this.mappingRegistry.set(connectionConstructor, new Map());
    }

    const connectionMapping = this.mappingRegistry.get(connectionConstructor);

    if (serviceConstructors) {
      for (const serviceConstructor of serviceConstructors) {
        if (!connectionMapping.has(serviceConstructor)) {
          connectionMapping.set(serviceConstructor, instanceSymbol);
        }
      }
    }
  }
}
