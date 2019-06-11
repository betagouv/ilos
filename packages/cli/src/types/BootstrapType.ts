import { Interfaces, Types } from "@ilos/core";

export type BootstrapType = {
  kernel?: () => Interfaces.KernelInterface,
  serviceProviders?: Types.NewableType<Interfaces.ServiceProviderInterface>[],
  transport?: {
    [key: string]: (kernel: Interfaces.KernelInterface) => Interfaces.TransportInterface,
  },
};
