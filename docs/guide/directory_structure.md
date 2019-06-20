---
title: Directory structure
lang: en-US
footer: Apache 2.0 Licensed
---

# Suggested directory structure

```
project
│   README.md
│   package.json    
│
└───services
    │
    └───greeting
        │   package.json
        │   ...
        │
        └───src
            │   bootstrap.ts
            │   ServiceProvider.ts
            │
            └───actions
            │   │   HelloAction.ts
            │   │   ...
            │
            └───config
            │   │   geeting.ts
            │   │   ...
            │
            └───interfaces
            │   │   CustomProviderInterface
            │   │   ...
            │
            └───providers
            │   │   CustomProvider
            │   │   ...
```

