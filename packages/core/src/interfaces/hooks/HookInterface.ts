import { ServiceContainerInterface } from "../ServiceContainerInterface";

export interface HookInterface {
  (container?: ServiceContainerInterface): Promise<void> | void;
}