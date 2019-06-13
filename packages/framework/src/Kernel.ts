import { Parents, Interfaces, Types } from '@ilos/core';
import { EnvProvider, EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CommandProvider } from '@ilos/cli';

import { CommandServiceProvider } from './CommandServiceProvider';

export class Kernel extends Parents.Kernel {
  readonly alias = [
    [EnvProviderInterfaceResolver, EnvProvider],
    [ConfigProviderInterfaceResolver, ConfigProvider],
    CommandProvider,
  ];

  readonly serviceProviders: Types.NewableType<Interfaces.ServiceProviderInterface>[] = [
    CommandServiceProvider,
  ];
}
