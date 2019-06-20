---
title: Start
lang: en-US
footer: Apache 2.0 Licensed
---
## Bootstrap
Last thing we need : a bootstrap file. Let's write it in `src/bootstrap.ts`;


```ts
import { ServiceProvider } from './ServiceProvider';

export const serviceProviders = [
  ServiceProvider,
];
```

## Start
```shell
yarn ilos http 8080
```

You just run an json rpc over http server. That's all !
