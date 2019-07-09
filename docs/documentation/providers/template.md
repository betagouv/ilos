---
title: Template
lang: en-US
footer: Apache 2.0 Licensed
---

# Template provider
The template provider aims to provide simple templating with [handlebars](https://handlebarsjs.com/).

## Installation
`yarn add @ilos/provider-template`

## Configuration

### Register to provider in service provider


```ts 

 public async boot() {
    await super.boot();
    this.registerTemplate();
 }

 protected registerTemplate() {
    const metadata = {
      'invite': {
        subject : 'Invitation',
      }
    } 
 
   this.getContainer()
     .get(TemplateProviderInterfaceResolver)
     .loadTemplatesFromDirectory(
       path.resolve(__dirname, 'templates'),
       metadata;
 }

```

When loading the template provider, you need to pass the name of the directory which is in this case : 'templates' and the metadata associated with template ( useful for email templating ) 

You can also define metadata configuration in a config file. 

```ts 
protected registerTemplate() {
    this.getContainer()
      .get(TemplateProviderInterfaceResolver)
      .loadTemplatesFromDirectory(
        path.resolve(__dirname, 'templates'),
        this.getContainer()
          .get(ConfigProviderInterfaceResolver)
          .get('template'),
      );
  }
```


### Define templates in directory

```

services
│
└───greeting
    |
    └───src
        |
        └───templates
        │   │   
        │   └─── invite.hbs 
        ...
```


## Usage


In order get config provider from IOC, you must add it in the constructor. 

```ts

    constructor(
        protected template: TemplateProviderInterfaceResolver,
    ) {}
    
    ... 
    
    const templateOptions = { fullname };
    const templateFileName = 'invite';
    
    const content = this.template.get(templateFileName, templateOptions);


```

The variable 'content' has the compile template 'invite' with the variables replaced defined in 'templateOptions'.


## Pattern

Templates are used in the [notification provider](/documentation/providers/notification)
