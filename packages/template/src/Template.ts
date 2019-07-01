import { Interfaces, Container } from '@ilos/core';
import { TemplateInterfaceResolver } from './TemplateInterface';
import { HandlebarsTemplate } from './HandlebarsTemplate';
// import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

export class Template implements Interfaces.RegisterHookInterface, Interfaces.InitHookInterface {
  readonly directory: string;
  readonly metadata: { [k: string]: any } = {};

  constructor(
    protected readonly container: Container.ContainerInterface,
  ) {
    //
  }

  async register() {
    this.container.bind(TemplateInterfaceResolver).to(HandlebarsTemplate);
  }

  async init() {
    // TODO: metadata from config
    // let metadata: { [k: string]: any };

    // if (typeof metadata === 'string') {
    //   metadata = this.container.get(ConfigProviderInterfaceResolver).get(metadata);
    // } else {
    //   metadata = this.metadata;
    // }

    this.container.get(TemplateInterfaceResolver).loadTemplatesFromDirectory(this.directory, this.metadata);
  }
}
