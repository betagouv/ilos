import { RegisterHookInterface } from '../interfaces/hooks/RegisterHookInterface';
import { ContainerInterface } from '../container';
import { NewableType } from '../types';
import { MiddlewareInterface } from '../interfaces';

export class Middlewares implements RegisterHookInterface {
  readonly middlewares: [string, NewableType<MiddlewareInterface>][] = [];

  constructor(protected readonly container: ContainerInterface) {
    //
  }

  public async register(): Promise<void> {
    this.middlewares.forEach(([name, middleware]) => {
      this.container.bind(name).to(middleware);
    });
  }
}
