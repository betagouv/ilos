import { Interfaces } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { TemplateInterfaceResolver } from '@ilos/template';

import { NotificationInterfaceResolver } from './NotificationInterface';
import { Notification } from './Notification';

export class NotificationExtension implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  static readonly key:string = 'notification';

  constructor(protected config?: {
    template: string,
    templateMeta: string | { [k:string]: any },
  }) {

  }

  register(serviceContainer: Interfaces.ServiceContainerInterface) {
    const container = serviceContainer.getContainer();

    if (!container.isBound(TemplateInterfaceResolver)) {
      throw new Error('Unable to find template provider');    
    }

    if (!container.isBound(ConfigInterfaceResolver)) {
      throw new Error('Unable to find config provider');
    }

    container.bind(Notification).toSelf()
    container.bind(NotificationInterfaceResolver).toService(Notification);
    serviceContainer.registerHooks(Notification.prototype, NotificationInterfaceResolver);
  }

  async init(serviceContainer: Interfaces.ServiceContainerInterface) {
    if (this.config) {
      const container = serviceContainer.getContainer();
      container
        .get(TemplateInterfaceResolver)
        .loadTemplatesFromDirectory(
          this.config.template,
          (typeof this.config.templateMeta === 'string') ? 
            container
              .get(ConfigInterfaceResolver)
              .get(this.config.templateMeta) :
            this.config.templateMeta,
        );
    }
  }
}
