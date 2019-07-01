import { Types, Interfaces } from '@ilos/core';

export interface ValidatorInterface extends Interfaces.ProviderInterface {
  registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorInterface;
  registerCustomKeyword(definition: any): ValidatorInterface;
  validate(data: any, validator?: string): Promise<boolean>;
}

export abstract class ValidatorInterfaceResolver implements ValidatorInterface {
  boot(): Promise<void> | void {
    return;
  }
  registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorInterface {
    throw new Error();
  }
  registerCustomKeyword(definition: any): ValidatorInterface {
    throw new Error();
  }
  async validate(data: any, validator?: string): Promise<boolean> {
    throw new Error();
  }
}
