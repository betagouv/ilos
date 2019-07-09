---
title: Start
lang: en-US
footer: Apache 2.0 Licensed
---
## Bootstrap
Last thing we need : a bootstrap file. Let's write it in `src/bootstrap.ts`;


```ts
import { bootstrap as baseBootstrap } from '@ilos/framework';
import { ServiceProvider } from './ServiceProvider';

export const bootstrap = baseBootstrap.create({
  serviceProviders: [
    ServiceProvider,
  ],
})
```

## Start
```shell
yarn ilos http 8080
```

You just run an json rpc over http server. That's all !
