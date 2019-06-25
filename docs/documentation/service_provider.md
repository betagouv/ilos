---
title: Service provider
lang: en-US
footer: Apache 2.0 Licensed
---
# Service provider

## Concept
Service provider aims to configure your service, especially : 
- declare handlers
- declare container binding (IOC configuration)
- declare middlewares
- etc...

## Recipes
### Container bindings
```ts
  readonly alias: any[] = [
    [MyInterfaceResolver, MyImplementation], // bind MyInterfaceResolver to MyImplementation
    MyIocReadyClass, // equivalent to [MyIocReadyClass, MyIocReadyClass]
  ];
```
You can add your bindings in a ready only property alias. By example, you can bind ConfigProviderInterfaceResolver to ConfigProvider. By doing this, if you add ConfigProviderInterfaceResolver in your constructor, the container will inject ConfigProvider.

If you want to declare custom bindings, you can override the register method.
```ts
  public register(module: ContainerModuleConfigurator):void {
    module.bind(MyInterfaceResolver).to(MyImplementation);
  }
```

You always can acces to the current container with `this.getContainer()`.

### Child services providers declaration
```ts
  readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [
    ChildServiceProvider,
  ];
```
You can add child service provider. In this case, ChildServiceProvider will access all of the bound class of the parent container. It can override it by declaring itself another alias.

### Declare handlers
```ts
  readonly handlers: NewableType<HandlerInterface>[] = [
    MyCustomAction,
  ];
```
Every handlers declared in the service provider will be callable by the kernel. 

### Bind middleware
```ts
  readonly middlewares: [string, NewableType<MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
  ];
```
This shorcut allow you to bind a string ('can') to a middleware class (PermissionMiddleware). By doing this, you can use the middleware in your action without importing it.

## Example
```ts
import { Parents, Interfaces, Types } from '@ilos/core';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly serviceProviders: Types.NewableType<Interfaces.ServiceProviderInterface>[] = [
    // Declare child service providers here  
  ];

  readonly alias: any[] = [
    // Declare your container resolution
    // ex: [MyProviderInterfaceResolver, MyProvider],
    // Or your bindings
    // ex: MyProvider,
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    // Declare here your handlers
    // ex: MyCustomAction,
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    // Declare middleware bindings
    // ex: ['can', PermissionMiddleware],  
  ];
}
```
