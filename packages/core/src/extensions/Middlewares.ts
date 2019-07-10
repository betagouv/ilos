import { NewableType } from '../types';
import {
  MiddlewareInterface,
  ServiceContainerInterface,
  RegisterHookInterface,
} from '../interfaces';

export class Middlewares implements RegisterHookInterface {
  static readonly key = 'middlewares';
  constructor(protected readonly middlewares: (NewableType<MiddlewareInterface> | [string, NewableType<MiddlewareInterface>])[]) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    const container = serviceContainer.getContainer();
    const alias = this.middlewares;

    for (const def of alias) {
      if (Array.isArray(def)) {
        const [id, target] = def;
        container.bind(id).to(target);
      } else {
        const identifier = <string>Reflect.getMetadata('extension:identifier', def);
        container.bind(def).toSelf();
        if (identifier) {
          container.bind(identifier).toService(def);
        }
      }
    }
  }
}
