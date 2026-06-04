import { app } from '~/index';
import { Command } from '~/schemas/command';

export default <Command>{
  name: '/owl-help',
  description: 'Displays a list of available commands',
  listener: async (ctx) => {
    await ctx.ack();

    const message: string[] = ['*Available commands:*'];
    for (const command of app.commands) {
      message.push(`${command.name}: ${command.description}`);
    }

    await ctx.respond({ text: message.join('\n') });
  },
};
