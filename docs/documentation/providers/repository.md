---
title: Repository
lang: en-US
footer: Apache 2.0 Licensed
---


# Repository provider

A repository is a class to manage all requests to database, casting values to make sure data going in and out is formated correctly.   

## Installation

`yarn add @ilos/provider-repository`

## Base

Define collection name, database name, validation schema, model and specific methods for your service. 


```ts 
@Container.provider()
export class ExampleRepositoryProvider extends ParentRepositoryProvider implements ExampleRepositoryProviderInterface {
  constructor(protected config: ConfigProviderInterfaceResolver, protected mongoProvider: MongoProvider) {
    super(config, mongoProvider);
  }
  
  public getKey(): string {
    return #collectionName#;
  }
    
  public getDatabase(): string {
    return #databaseName#;
  }
    
  public getSchema(): object {
    return #modelValidationSchema#;
  }
    
  public getModel(): #Model# {
    return #Model#;
  }
  
  public ExampleSpecificMethod(params: any): Promise<any> {
    // do something
    return result;
  }


}

```

ParentRepository has basic CRUD (specifically :  find, all, create, delete, update, updateOrCreate, patch, clear ) and mongo id casting. 
Models can be instantiated by constructing the model with instantiate or instantiateMany ( for array ) methods. 
See [parent repository provider](https://github.com/betagouv/ilos/blob/master/packages/provider-repository/src/ParentRepositoryProvider.ts) for details. 


## Config

### Add interface and interface Resolver

```ts 
export interface UserRepositoryProviderInterface extends ParentRepositoryProviderInterface {
    ExampleSpecificMethod(params: any): Promise<any>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
    public ExampleSpecificMethod(params: any): Promise<any> {
        throw new Error();
    }
}
```

Make sur interface and interfaceResolver are up to date with the repository. 

### Add to service provider alias 

```ts 
export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {

    readonly alias = [
        [ExampleRepositoryProviderInterfaceResolver, ExampleRepositoryProvider],
        MongoProvider,
    ];

}
```


## Usage

See [handler](/documentation/handler) for usage in handler



