---
title: Validator
lang: en-US
footer: Apache 2.0 Licensed
---
# Validator provider
The validator provider provide method to validate input data.

## Installation
`yarn add @ilos/provider-validator`

## Configuration
The packaged implementation of the validator provider use JSON Schema validation (with [ajv](http://ajv.js.org)).

In your service provider, you may bind `ValidatorProviderInterfaceResolver` with the implementation of your choice. You can register validators with the following method: 
`registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorProviderInterface;`
By example, in the packaged implementation, you can register a schema with a key by doing this: 
```ts
registerValidator(mySchema, 'myKey');
```

You can also register custom keywords with `registerCustomKeyword(definition: any): ValidatorProviderInterface;`.
By example, in the packaged implementation, you can add a json schema string format with : 
```ts
registerCustomKeyword({
  name: 'id'
  type: 'format',
  definition: (data:string):boolean => true,
});
```
### Configuration example
`/services/greeting/src/ServiceProvider.ts`
```ts
import { Parents, Interfaces, Types } from '@ilos/core';
import { ValidatorProviderInterfaceResolver, AjvProvider } from '@ilos/provider-validator';
import { HelloAction } from './actions/HelloAction';
import { helloActionParamsSchema } from './schemas/helloActionParamsSchema';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly alias: any[] = [
    [ValidatorProviderInterfaceResolver, AjvProvider],
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    HelloAction
  ];

  protected readonly validators: [string, any][] = [
    ['greeting.hello', helloActionParamsSchema],
  ];

  public async boot() {
    await super.boot();
    this.registerValidators();
  }

  protected registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}
```

## Usage
In order get validator provider from IOC, you must add it in the constructor. Then, you can do

```ts
this.validator.validate(data, key?: string);
```

The first argument is the data, the second is the key.

## Example
```ts
import { Parents, Container, Types } from '@ilos/core';
import { ValidatorProviderInterfaceResolver } from '@ilos/provider-validator';

type HelloParamsType = {
  name: string,
};

@Container.handler({
  service: 'greeting',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
    private validator: ValidatorProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: HelloParamsType,
    context: Types.ContextType,
  ): Promise<string> {
    if (!this.validate(params, 'greeting.hello')) {
      throw new Error('Wrong');
    }
    return `Hello ${params.name}`;
  }
}
```
