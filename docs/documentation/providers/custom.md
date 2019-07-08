---
title: Create a custom provider
lang: en-US
footer: Apache 2.0 Licensed
---

# Configuration

## Suggested directory structure


```
providers
│
└───custom
    │   CustomProvider.ts
    |   CustomProvider.spec.ts
    │   packages.json
    |   tsconfig.json
    |   index.ts
    |
    └─── interfaces
        |   CustomProviderInterface.ts
```


## Base 

CustomProvider.ts defines the exported methods of the provider. 

```ts 
@Container.provider()
export class CustomProvider implements CustomProviderInterface {
    public doSomething(params:any): any {
        return data;
    }
}
```


## Interface and Interface resolver


```ts 
import { Interfaces } from '@ilos/core';

export interface CryptoProviderInterface extends Interfaces.ProviderInterface{
  boot();
  doSomething(params:any): any;
}

export abstract class CryptoProviderInterfaceResolver implements CryptoProviderInterface{
  async boot() {
    throw new Error();
  }
  doSomething(params:any): any {
    throw new Error();  
  }
}
```

## Name

Name your provider in package.json and update versions 

```json
{
  "name": "@pdc/provider-custom",
  "version": "0.0.1",
  ...
  
}
```

# Usage

Add provider in constructor dependencies using Ilos IOC. 


