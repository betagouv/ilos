---
title: Create a service provider
lang: en-US
footer: Apache 2.0 Licensed
---
# Service provider

## Scaffold a service provider
```shell
yarn ilos generate ServiceProvider
```

Now you've a file in `src/ServiceProvider.ts`. The service provider is an orchestrator around handlers, here you can define your ioc bindings, register nested service providers, declare middleware. In this example, we just use service provider as handler registry.

## Example
```ts
import { Container, Parents } from '@ilos/core';
import { HelloAction } from './action/HelloAction';

@Container.serviceProvider({
  handlers: [
    HelloAction,
  ]
})
export class ServiceProvider extends Parents.ServiceProvider {}
```
