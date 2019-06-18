import { Container, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { TemplateProviderInterfaceResolver } from '@ilos/provider-template';

import { MailjetDriver } from './mail/MailjetDriver';
import { MailDriverInterface, MailInterface, TemplateMailInterface } from './mail/MailDriverInterface';
import { NotificationConfigurationType } from './NotificationConfigurationType';
import { NotificationProviderInterface } from './NotificationProviderInterface';

@Container.provider()
export class NotificationProvider implements NotificationProviderInterface {
  protected config: NotificationConfigurationType;
  protected mailDriver: MailDriverInterface;
  protected mailDrivers: { [key:string]: Types.NewableType<MailDriverInterface> } = {
    mailjet: MailjetDriver,
  };

  constructor(
    protected configProvider: ConfigProviderInterfaceResolver,
    protected template: TemplateProviderInterfaceResolver,
  ) {
    //
  }

  boot() {
    this.config = this.configProvider.get('notification');
    this.registerMailDriver();
  }

  protected registerMailDriver() {
    if (!(this.config.mail.driver in this.mailDrivers)) {
      throw new Error(`Mail driver ${this.config.mail.driver} not found`);
    }

    this.mailDriver = new this.mailDrivers[this.config.mail.driver](
      {
        from: this.config.mail.from,
        defaultSubject: this.config.mail.defaultSubject,
      },
      <any>this.config.mail.driverOptions,
    );
  }

  async sendByEmail(mail: MailInterface): Promise<void> {
    if ('debug' in this.config.mail.sendOptions) {
      //
    }
    return this.mailDriver.send(mail, this.config.mail.sendOptions);
  }

  async sendTemplateByEmail(mail: TemplateMailInterface): Promise<void> {
    const { template, email, fullname, opts } = mail;

    let { subject } = this.template.getMetadata(template);

    const content = this.template.get(template, { email, fullname, subject, ...opts });

    return this.sendByEmail({
      email,
      fullname,
      subject,
      content,
    });
  }
}
