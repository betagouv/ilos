---
title: Installation
lang: en-US
footer: Apache 2.0 Licensed
---
# Installation

## Requirements
- Node > 10
- Yarn (prefered) or Npm

## Create your project
```shell
mkdir myproject
cd myproject
yarn init
yarn add @ilos/framework
```

In your package.json, you may add: 
```json
scripts: {
  "ilos": "ilos",
}
```

Now you have access to ilos [cli](/documentation/cli) and start scaffolding.