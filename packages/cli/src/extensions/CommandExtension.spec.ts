// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { ServiceProvider } from '@ilos/core';
import { command, serviceProvider, ResultType } from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';

import { CommandExtension } from './CommandExtension';
import { Command } from '../parents/Command';


@command()
class BasicCommand extends Command {
  public readonly signature: string = 'hello <name>';
  public readonly options = [
    {
      signature: '-h, --hi',
      description: 'Say hi',
    },
  ];

  public async call(name, options?):Promise<ResultType> {
    if (options && 'hi' in options) {
      return `Hi ${name}`;
    }
    return `Hello ${name}`;
  }
}

@serviceProvider({
  commands: [
    BasicCommand,
  ],
})
class BasicServiceProvider extends ServiceProvider {
  extensions = [CommandExtension];
}

describe('Command extension', () => {
  it('should register properly', async () => {
    const serviceProvider = new BasicServiceProvider();
    await serviceProvider.register();
    await serviceProvider.init();

    const command = serviceProvider.getContainer().get(CommandRegistry).commands[0];

    expect(command.name()).to.equal('hello');
    expect(command.options).to.have.length(1);
    expect(command.options[0]).to.deep.include({
      flags: '-h, --hi',
      required: false,
      optional: false,
      bool: true,
      short: '-h',
      long: '--hi',
      description: 'Say hi',
    });
  });

  it('should work', (done) => {
    const serviceProvider = new BasicServiceProvider();
    const container = serviceProvider.getContainer();
    serviceProvider.register().then(() => {
      serviceProvider.init().then(() => {
        const commander = container.get<CommandRegistry>(CommandRegistry);
        sinon.stub(commander, 'output').callsFake((...args: any[]) => {
          expect(args[0]).to.equal('Hello john');
          done();
        });
        container.unbind(CommandRegistry);
        container.bind(CommandRegistry).toConstantValue(commander);
        commander.parse(['', '', 'hello', 'john']);
        sinon.restore();
      });
    });
  });
});
