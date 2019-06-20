---
title: Handler
lang: en-US
footer: Apache 2.0 Licensed
---
# Handler

## Concept
An handler is a class which contains only the business logic : 
- no transport (http, redis, etc.) ;
- no serialization (json, protobuf, etc.) ;
- no direct connection with dependencies (use provider instead) ;
- no implementation strongly bound to external dependencies (use interfaces!) ;

### Wrong
```ts
import { Types } from '@ilos/core';

async call({ params }) {
  return this.mongo.find({ name: {$eq: params.name }});
}
```

### Good
```ts
async call({ params }) {
  return this.repository.findByName(params.name);
}
```

## Configuration
You must decorate your handler :
```ts
import { Container } from '@ilos/core';

@Container.handler({
  service: 'greeting',
  method: 'hello',
  version: '0.0.1',
})
class Action implements HandlerInterface {}
```
Notes: 
- The version default is 'latest', you may omit this params ;
- The method could be '*' to catch all service request (used by remote handler by example) ;

## Usage
### Dependencies
You can use the ioc engine to get providers (among others) in your handler. Just add it to the constructor:
```ts
  constructor(
    private repository: RepositoryProviderInterfaceResolver, // get an implementation from interface bindings
    private custom: CustomProvider, // get an implementation
  ) {
    //
  }
```

### Boot method
The boot method is called after instanciation of the class, if you want to initialize some stuff. You get the current container as first (and only) argument.

### Call/Handle

The business logic is in the call function but you may use action (which includes some sugar for most use case). If so, you can write: 
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
