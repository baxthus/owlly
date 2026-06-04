import type { Command } from '~/schemas/command';

export default <Command>{
  name: '/owl-ping',
  listener: async (ctx) => {
    const start = Date.now();
    await ctx.ack();
    const end = Date.now();

    const latency = end - start;

    await ctx.respond(`Pong!\nLatency: ${latency}ms`);
  },
};
