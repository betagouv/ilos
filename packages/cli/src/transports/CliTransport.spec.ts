// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { Parents, Container, Types, Interfaces } from '@ilos/core';

import { CommandExtension } from '../extensions/CommandExtension';
import { Command } from '../parents/Command';
import { CommandRegistry } from '../providers/CommandRegistry';

import { CliTransport } from './CliTransport';

@Container.command()
class BasicCommand extends Command {
  public readonly signature: string = 'hello <name>';
  public readonly options = [
    {
      signature: '-h, --hi',
      description: 'Say hi',
    },
  ];

  public async call(name, options?):Promise<Types.ResultType> {
    if (options && 'hi' in options) {
      return `Hi ${name}`;
    }
    return `Hello ${name}`;
  }
}

@Container.kernel({
  commands: [BasicCommand],
})
class BasicKernel extends Parents.Kernel {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    CommandExtension,
  ];
}

describe('Cli transport', () => {
  it('should work', (done) => {
    const kernel = new BasicKernel();
    kernel.bootstrap().then(() => {
      const cliTransport = new CliTransport(kernel);
      const container = kernel.getContainer();
      const commander = container.get<CommandRegistry>(CommandRegistry);
      sinon.stub(commander, 'output').callsFake((...args: any[]) => {
        expect(args[0]).to.equal('Hello john');
        done();
      });
      container.unbind(CommandRegistry);
      container.bind(CommandRegistry).toConstantValue(commander);
      cliTransport.up(['', '', 'hello', 'john']);
      sinon.restore();
    });
  });
});
