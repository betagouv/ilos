---
title: Config
lang: en-US
footer: Apache 2.0 Licensed
---
# Config provider
The config provider aims to provide an access to config files.

## Installation
`yarn add @ilos/provider-config`

## Configuration
By default, the config provider will search config file from #APP_WORKING_PATH/config. You can use ts/js file or yaml files.

`/services/greeting/src/config/greeting.ts`
```ts
declare function env(key: string, fallback?: string): any;
export const hi = env('APP_HI');
```

In your service provider, you may bind `ConfigProviderInterfaceResolver` with the implementation of your choice.
`/services/greeting/src/ServiceProvider.ts`
```ts
import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver, ConfigProvider } from '@ilos/provider-config';
import { HelloAction } from './action/HelloAction';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    HelloAction
  ];
}
```

You can also force config provider to load a specific directory by using the following method : `loadConfigDirectory(workingPath: string, configDir?: string): void;`


## Usage
In order get config provider from IOC, you must add it in the constructor. Then, you can do

```ts
this.config.get(key, fallback);
```

The first argument is the config key, the second is the fallback. You can omit the fallback but if you do so, the config provider will raise Error on key not found.

## Example
```ts
import { Parents, Container, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

type HelloParamsType = {
  name: string,
};

@Container.handler({
  service: 'greeting',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
    private config: ConfigProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: HelloParamsType,
    context: Types.ContextType,
  ): Promise<string> {
    const greeting = this.config.get('greeting.hi', 'Hello');

    return `${greeting} ${params.name}`;
  }
}
```
