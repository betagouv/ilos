---
title: Create an action
lang: en-US
footer: Apache 2.0 Licensed
---
# Action
## Scaffold a new action
```shell
yarn ilos generate Handler Hello
```
Now you've a file in `src/actions/HelloAction.ts`;

## Handler name
```ts
@Container.handler({
  service: 'myService',
  method: 'Hello',
})
```
Here you can configure your handler service name, method name and even version (default is 'latest')

## Handler dependencies
```ts
export class HelloAction extends Parents.Action {
  constructor(
    // here inject your dependencies
    // private provider: MyProviderInterfaceResolver,
  ) {
    super();
  }
}
```
In the constructor your can add your dependencies using Ilos IOC. By example, you may add your database repository provider to access data from db.
Note: you may inject interface and bind implementation later in the service provider and not the final class directly

## Handler implementation
```ts
 protected async handle(
    params: Types.ParamsType,
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    // 
  }
```
Here, you have a single method which receive two arguments. The first one is the parameters of the call (could be anything) and the second one is a context object. You can return anything serializable to JSON (or return nothing).

## Example

```ts
import { Parents, Container, Types } from '@ilos/core';

type HelloParamsType = {
  name: string,
};

@Container.handler({
  service: 'greeting',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
  ) {
    super();
  }

  protected async handle(
    params: HelloParamsType,
    context: Types.ContextType,
  ): Promise<string> {
    return `Hello ${params.name}`;
  }
}
```

