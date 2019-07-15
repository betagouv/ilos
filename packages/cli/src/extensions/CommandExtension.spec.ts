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

  public async call(name, options?): Promise<ResultType> {
    if (options && 'hi' in options) {
      return `Hi ${name}`;
    }
    return `Hello ${name}`;
  }
}

@serviceProvider({
  commands: [BasicCommand],
})
class BasicServiceProvider extends ServiceProvider {
  extensions = [CommandExtension];
}

describe('Command extension', () => {
  it('should register properly', async () => {
    const basicServiceProvider = new BasicServiceProvider();
    await basicServiceProvider.register();
    await basicServiceProvider.init();

    const basicCommand = basicServiceProvider.getContainer().get(CommandRegistry).commands[0];

    expect(basicCommand.name()).to.equal('hello');
    expect(basicCommand.options).to.have.length(1);
    expect(basicCommand.options[0]).to.deep.include({
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
    const basicServiceProvider = new BasicServiceProvider();
    const container = basicServiceProvider.getContainer();
    basicServiceProvider.register().then(() => {
      basicServiceProvider.init().then(() => {
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
