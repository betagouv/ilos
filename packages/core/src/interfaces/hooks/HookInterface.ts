import { ServiceContainerInterface } from '../ServiceContainerInterface';

export type HookInterface = (container?: ServiceContainerInterface) => Promise<void> | void;
