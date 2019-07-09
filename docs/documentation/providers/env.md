---
title: Env
lang: en-US
footer: Apache 2.0 Licensed
---
# Env
The env provider aims to provide an access to environment variables.

## Installation
`yarn add @ilos/env`

Note: this package is already loaded by the framework.

## Configuration
By default, the env provider will load environment variables from .env file and process.env.

You can also force env provider to load a specific env file by adding the `env` keyword in the decorator : 
```ts
@Container.serviceProvider({
  env: '/my/custom/path/to/.env',
})
```

## Usage
In order get env provider from IOC, you must add it in the constructor. Then, you can do

```ts
this.env.get(key, fallback);
```

The first argument is the env key, the second is the fallback. You can omit the fallback but if you do so, the env provider will raise Error on key not found.

## Pattern
You should use env provider in config file instead of using directly in your handlers. See [Config Provider](/documentation/providers/config)

## Custom implementation
You can replace the packaged env provider with your own implementation by binding the `EnvInterfaceResolver` with a class which implements `EnvInterface`.