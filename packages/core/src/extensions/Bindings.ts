import { RegisterHookInterface } from '../interfaces/hooks/RegisterHookInterface';
import { ContainerInterface } from '../container';

export class Bindings implements RegisterHookInterface {
  readonly alias: any[] = [];

  constructor(protected readonly container: ContainerInterface) {
    //
  }

  public async register(): Promise<void> {
    this.alias.forEach((def) => {
      if (Array.isArray(def)) {
        const [alias, target] = def;
        this.container.bind(alias).to(target);
      } else {
        this.container.bind(def).toSelf();
      }
    });
  }
}
