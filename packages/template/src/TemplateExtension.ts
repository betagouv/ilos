import {
  ConfigInterfaceResolver,
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  TemplateInterfaceResolver,
} from '@ilos/common';

import { HandlebarsTemplate } from './HandlebarsTemplate';

export class TemplateExtension implements RegisterHookInterface, InitHookInterface {
  static readonly key:string = 'template';

  constructor(protected config?: {
    path: string,
    meta: string | { [k:string]: any },
  }) {

  }

  register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();

    if (!container.isBound(ConfigInterfaceResolver)) {
      throw new Error('Unable to find config provider');
    }

    container.bind(HandlebarsTemplate).toSelf();
    container.bind(TemplateInterfaceResolver).toService(HandlebarsTemplate);
    serviceContainer.registerHooks(HandlebarsTemplate.prototype, TemplateInterfaceResolver);
  }

  async init(serviceContainer: ServiceContainerInterface) {
    if (this.config) {
      const container = serviceContainer.getContainer();
      container
        .get(TemplateInterfaceResolver)
        .loadTemplatesFromDirectory(
          this.config.path,
          (typeof this.config.meta === 'string') ?
            container
              .get(ConfigInterfaceResolver)
              .get(this.config.meta, {}) :
            this.config.meta,
        );
    }
  }
}
