import { Interfaces } from '@ilos/core';
import { MailInterface, TemplateMailInterface } from './mail/MailDriverInterface';

export interface NotificationProviderInterface extends Interfaces.ProviderInterface {
  sendByEmail(mail: MailInterface): Promise<void>;
  sendTemplateByEmail(mail: TemplateMailInterface): Promise<void>;
}

export abstract class NotificationProviderInterfaceResolver implements NotificationProviderInterface {
  boot() {
    return;
  }

  async sendByEmail(mail: MailInterface): Promise<void> {
    throw new Error();
  }

  async sendTemplateByEmail(mail: TemplateMailInterface): Promise<void> {
    throw new Error();
  }
}
