// tslint:disable max-classes-per-file
import { expect } from 'chai';
import sinon from 'sinon';

import { Kernel } from '@ilos/core';
import {
  command as commandDecorator,
  kernel as kernelDecorator,
  ResultType,
  NewableType,
  ExtensionInterface,
} from '@ilos/common';

import { CommandExtension } from '../extensions/CommandExtension';
import { Command } from '../parents/Command';
import { CommandRegistry } from '../providers/CommandRegistry';
import { CliTransport } from './CliTransport';

describe('Cli transport', function() {
  @commandDecorator()
  class BasicCommand extends Command {
    static readonly signature: string = 'hello <name>';
    static readonly description: string = 'The hello world command';
    static readonly options = [
      {
        signature: '-h, --hi',
        description: 'Say hi',
      },
    ];

    public async call(name, options?): Promise<ResultType> {
      if (options && 'hi' in options) {
        return `Hi ${name}`;
      }
      return `Hello ${name}`;
    }
  }

  @kernelDecorator({
    commands: [BasicCommand],
  })
  class BasicKernel extends Kernel {
    readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension];
  }

  after(function() {
    sinon.restore();
  });

  it('should work', function(done) {
    this.timeout(1000);
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
    });
  });
});
