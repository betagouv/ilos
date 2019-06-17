import { Interfaces } from '@ilos/core';

export interface TemplateProviderInterface extends Interfaces.ProviderInterface {
  setMetadata(templateName: string, metadata: any): void;

  getMetadata(templateName: string): any;

  set(templateName: string, template: string): void;

  get(templateName: string, opts: any): string;

  render(template: string, opts: any): string;
}

export abstract class TemplateProviderInterfaceResolver implements TemplateProviderInterface {
  async boot() {
    return;
  }

  setMetadata(templateName: string, metadata: any): void {
    throw new Error();
  }

  getMetadata(templateName: string): any {
    throw new Error();
  }

  set(templateName: string, template: string): void {
    throw new Error();
  }

  get(templateName: string, opts: any): string {
    throw new Error();
  }

  render(template: string, opts: any): string {
    throw new Error();
  }
}
