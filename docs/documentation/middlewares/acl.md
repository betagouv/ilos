---
title: Authorization
lang: en-US
footer: Apache 2.0 Licensed
---

# Authorizations

Check if the user making the request is authorized to proceed. 


## Usage


#### Call middleware in service provider


```ts
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['permissionName']],
  ];

```

In this case 'permissionName' must be among the user's permissions, defined in the context. You can specify more than one permission. 


#### Register to middleware in service provider


```ts

readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
  ];

```
