import z from 'zod';

import { Command } from '~/schemas/command';

const schema = z
  .object({
    url: z.url(),
  })
  .array()
  .length(1);

export const command = <Command>{
  name: '/owl-cat',
  description: 'Get a random cat image',
  uses: ['TheCatAPI'],
  listener: async (ctx) => {
    await ctx.ack();

    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    if (!response.ok) {
      await ctx.respond({ text: 'Failed to fetch cat image' });
      return;
    }

    const result = schema.safeParse(await response.json());
    if (!result.success) {
      await ctx.respond({ text: 'Failed to fetch cat image' });
      return;
    }

    await ctx.respond({
      blocks: [
        // oxlint-disable-next-line typescript/no-non-null-assertion
        { type: 'image', image_url: result.data[0]!.url, alt_text: 'cat' },
        { type: 'context', elements: [{ type: 'mrkdwn', text: `> Powered by TheCatAPI` }] },
      ],
    });
  },
};
