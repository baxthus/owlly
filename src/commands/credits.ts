import { HeaderBlock } from '@slack/types';

import { app } from '~/index';
import { Command } from '~/schemas/command';
import { createTableBlock } from '~/utils/create-table';

export const command = <Command>{
  name: '/owl-credits',
  description: 'List of all external APIs used by the bot',
  listener: async (ctx) => {
    await ctx.ack();

    await ctx.respond({
      blocks: [
        <HeaderBlock>{
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Credits`,
          },
          level: 1,
        },
        createTableBlock(
          ['Command', 'Uses'],
          app.commands
            .filter((cmd) => cmd.uses?.length)
            .map((cmd) => ({
              Command: cmd.name,
              Uses: cmd.uses?.join(', ') ?? '',
            })),
        ),
      ],
    });
  },
};
