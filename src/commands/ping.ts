import { HeaderBlock } from '@slack/types';

import { Action } from '~/schemas/action';
import type { Command } from '~/schemas/command';

export const command = <Command>{
  name: '/owl-ping',
  description: 'Replies with Pong!',
  listener: async (ctx) => {
    await ctx.ack();
    await ctx.respond({
      blocks: [
        <HeaderBlock>{
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Pong!`,
          },
          level: 1,
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Latency',
              },
              action_id: 'owl-latency-button',
            },
          ],
        },
      ],
    });
  },
};

export const action = <Action>{
  id: 'owl-latency-button',
  listener: async (ctx) => {
    const start = performance.now();
    await ctx.ack();
    const end = performance.now();

    const latency = end - start;

    await ctx.respond(`Latency: ${latency}ms`);
  },
};
