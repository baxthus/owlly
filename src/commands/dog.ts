import z from 'zod';

import { Command } from '~/schemas/command';

const schema = z.object({
  status: z.literal('success'),
  message: z.url(),
});

export const command = <Command>{
  name: '/owl-dog',
  description: 'Get a random cat image',
  uses: ['dog.ceo'],
  listener: async (ctx) => {
    await ctx.ack();

    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    if (!response.ok) {
      await ctx.respond({ text: 'Failed to fetch dog image' });
      return;
    }

    const result = schema.safeParse(await response.json());
    if (!result.success) {
      await ctx.respond({ text: 'Failed to parse dog image' });
      return;
    }

    await ctx.respond({
      blocks: [
        { type: 'image', image_url: result.data.message, alt_text: 'dog' },
        { type: 'context', elements: [{ type: 'mrkdwn', text: '> Powered by dog.ceo' }] },
      ],
    });
  },
};
