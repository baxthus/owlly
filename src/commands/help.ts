import { app } from '~/index';
import { Command } from '~/schemas/command';
import { createTableBlock } from '~/utils/create-table';

export default <Command>{
  name: '/owl-help',
  description: 'Displays a list of available commands',
  listener: async (ctx) => {
    await ctx.ack();

    await ctx.respond({
      blocks: [
        {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [{ type: 'text', text: 'Available commands', style: { bold: true } }],
            },
          ],
        },
        createTableBlock(
          ['Command', 'Description'],
          app.commands.map((command) => ({
            Command: command.name,
            Description: command.description,
          })),
        ),
      ],
    });
  },
};
