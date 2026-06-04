import type { Command } from '~/schemas/command';

export const command = <Command>{
  name: '/owl-ping',
  description: 'Replies with Pong!',
  listener: async (ctx) => {
    const start = Date.now();
    await ctx.ack();
    const end = Date.now();

    const latency = end - start;

    await ctx.respond(`Pong!\nLatency: ${latency}ms`);
  },
};
