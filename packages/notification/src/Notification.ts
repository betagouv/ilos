import {
  provider,
  NewableType,
  ConfigInterfaceResolver,
  TemplateInterfaceResolver,
  MailDriverInterface,
  MailInterface,
  TemplateMailInterface,
  NotificationConfigurationType,
  NotificationInterface,
  NotificationInterfaceResolver,
} from '@ilos/common';

import { MailjetDriver } from './mail/MailjetDriver';

@provider({
  identifier: NotificationInterfaceResolver,
})
export class Notification implements NotificationInterface {
  protected config: NotificationConfigurationType;
  protected mailDriver: MailDriverInterface;
  protected mailDrivers: { [key:string]: NewableType<MailDriverInterface> } = {
    mailjet: MailjetDriver,
  };

  constructor(
    protected configProvider: ConfigInterfaceResolver,
    protected template: TemplateInterfaceResolver,
  ) {
    //
  }

  async init() {
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
      this.config.mail.driverOptions,
    );
  }

  async sendByEmail(mail: MailInterface): Promise<void> {
    if ('debug' in this.config.mail.sendOptions) {
      // FIX ME : add a check on debug > "to" options erase initial target
    }
    return this.mailDriver.send(mail, this.config.mail.sendOptions);
  }

  async sendTemplateByEmail(mail: TemplateMailInterface): Promise<void> {
    const { template, email, fullname, opts } = mail;

    let subject;
    try {
      const meta = this.template.getMetadata(template);
      subject = meta.subject;
    } catch (e) {
      subject = this.config.mail.defaultSubject;
    }

    const content = this.template.get(template, { email, fullname, subject, ...opts });

    return this.sendByEmail({
      email,
      fullname,
      subject,
      content,
    });
  }
}
