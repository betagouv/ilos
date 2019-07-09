import { RegisterHookInterface } from '../interfaces/hooks/RegisterHookInterface';
import { ServiceIdentifier } from '../container';
import { NewableType } from '../types';
import { ServiceContainerInterface } from '../interfaces';

export class Providers implements RegisterHookInterface {
  static readonly key = 'providers';

  constructor(protected readonly alias: (NewableType<any> | [ServiceIdentifier, NewableType<any>])[]) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    const container = serviceContainer.getContainer();
    const alias = this.alias;
    for (const def of alias) {
      let target: NewableType<any>;
      if (Array.isArray(def)) {
        if (def.length !== 2) {
          throw new Error('Invalid bindings');
        }
        const identifier = def[0];
        target = def[1];
        container.bind(target).toSelf();
        container.bind(identifier).toService(target);
      } else {
        const customIdentifier = <ServiceIdentifier | ServiceIdentifier[]>Reflect.getMetadata('extension:identifier', def);
        target = def;
        container.bind(target).toSelf();
        if (customIdentifier) {
          if (!Array.isArray(customIdentifier)) {
            container.bind(customIdentifier).toService(def);
          } else {
            for (const id of customIdentifier) {
              container.bind(id).toService(def);
            }
          }
        }
      }
      serviceContainer.registerHooks(target.prototype, target);
    }
  }
}
