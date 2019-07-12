import { InitHookInterface, DestroyHookInterface, RegisterHookInterface } from '../hooks';
import { NewableType } from '../shared';

export type ExtensionInterface = InitHookInterface | DestroyHookInterface | RegisterHookInterface;

export interface ExtensionStaticInterface {
  readonly key: string;
  new (...args: any[]): ExtensionInterface;
}

export type ExtensionConfigurationType = {
  name: string;
  key?: symbol;
  autoload?: boolean;
  decoratorKey?: symbol;
  require?: NewableType<ExtensionInterface>[];
  override?: boolean;
};

export const extensionConfigurationMetadataKey = Symbol.for('extensionConfiguration');