import { Interfaces, Types } from '@ilos/core';

export type BootstrapType = {
  serviceProviders?: Types.NewableType<Interfaces.ServiceContainerInterface>[];
  transport?: {
    [key: string]: (kernel: Interfaces.KernelInterface) => Interfaces.TransportInterface;
  };
  kernel?(): Types.NewableType<Interfaces.KernelInterface>;
};
