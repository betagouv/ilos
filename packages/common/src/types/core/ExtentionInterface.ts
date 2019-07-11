import { InitHookInterface, DestroyHookInterface, RegisterHookInterface } from '../hooks';

export type ExtensionInterface = InitHookInterface | DestroyHookInterface | RegisterHookInterface;

export interface ExtensionStaticInterface {
  readonly key: string;
  new (...args: any[]): ExtensionInterface;
}
