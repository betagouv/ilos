import { HookInterface, ServiceContainerInterface } from '../interfaces';
import { IdentifierType } from '../types';
import { hasInterface } from '../helpers/types/hasInterface';

export class HookRegistry<T> {
  protected registry: Set<HookInterface> = new Set();
  protected dispatched = false;

  constructor(
    protected method: string,
    protected authorizeIdentifierLookup = true,
  )
  {
    //
  }

  public register(hooker: object, identifier?: IdentifierType): void {
    if (
      hasInterface<T>(hooker, this.method)
      && (
        !identifier
        || this.authorizeIdentifierLookup
      )
    ) {
      let hook = async (container: ServiceContainerInterface) => hooker[this.method](container);
      if (identifier) {
        hook = async (container: ServiceContainerInterface) =>
          container
            .getContainer()
            .get<T>(identifier)
            [this.method](container);
      }
      this.add(hook);
    }
    return;
  }

  protected add(hook: HookInterface) {
    if (!this.dispatched) {
      this.registry.add(hook);
    }
  }

  public async dispatch(serviceContainer: ServiceContainerInterface) {
    this.dispatched = true;
    for (const [hook] of this.registry.entries()) {
      await hook(serviceContainer);
    }
    this.registry.clear();
  }
}