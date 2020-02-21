import { expect } from 'chai';

import { ResultType, CommandOptionType } from '@ilos/common';

import { Command } from './Command';

describe('Command', function() {
  it('works', async function() {
    class BasicCommand extends Command {
      static readonly signature: string = 'hello <name>';
      static readonly description: string = 'basic hello command';
      static readonly options: CommandOptionType[] = [{ signature: '-h, --hi', description: 'hi' }];
      public async call(name, opts): Promise<ResultType> {
        if (name === 'crash') {
          throw new Error();
        }
        return opts && 'hi' in opts ? `Hi ${name}!` : `Hello ${name}!`;
      }
    }
    const cmd = new BasicCommand();
    const r = await cmd.call('John', {});
    expect(r).to.eq('Hello John!');
  });
});
