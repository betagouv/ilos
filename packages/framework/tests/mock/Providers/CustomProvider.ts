import { Container, Interfaces } from '@ilos/core';

@Container.provider()
export class CustomProvider implements Interfaces.ProviderInterface {
  private value: string;

  boot() {
    this.value = 'default';
  }

  get() {
    return this.value;
  }

  set(value:string) {
    this.value = value;
  }
}
