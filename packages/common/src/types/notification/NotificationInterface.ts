import { MailInterface, TemplateMailInterface } from './MailDriverInterface';
import { ProviderInterface } from '../core';
import { InitHookInterface } from '../hooks';

export interface NotificationInterface extends ProviderInterface, InitHookInterface {
  sendByEmail(mail: MailInterface): Promise<void>;
  sendTemplateByEmail(mail: TemplateMailInterface): Promise<void>;
}

export abstract class NotificationInterfaceResolver implements NotificationInterface {
  async init() {
    return;
  }

  async sendByEmail(mail: MailInterface): Promise<void> {
    throw new Error();
  }

  async sendTemplateByEmail(mail: TemplateMailInterface): Promise<void> {
    throw new Error();
  }
}
