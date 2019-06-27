import { Interfaces, Types } from '@ilos/core';

export type BootstrapType = {
  serviceProviders?: Types.NewableType<Interfaces.ServiceProviderInterface>[];
  transport?: {
    [key: string]: (kernel: Interfaces.KernelInterface) => Interfaces.TransportInterface;
  };
  kernel?(): Interfaces.KernelInterface;
};
