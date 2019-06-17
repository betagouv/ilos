import { Interfaces } from '@ilos/core';

export interface MailInterface {
  email: string;
  fullname: string;
  subject: string;
  content: any;
}

export interface MailDriverInterface {
  send(mail: MailInterface, opts?: { [key:string]: any}): Promise<void>;
}
