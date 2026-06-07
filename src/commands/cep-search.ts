import { PlainTextInputAction } from '@slack/bolt';
import { Block } from '@slack/types';
import z from 'zod';

import { Action } from '~/schemas/action';
import { Command } from '~/schemas/command';
import { createTableBlock } from '~/utils/create-table';

const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/);

const searchSchema = z.object({
  cep: cepSchema,
  state: z.string().length(2),
  city: z.string(),
  neighborhood: z.string(),
  street: z.string(),
  service: z.string(),
  location: z.object({
    type: z.string(),
    coordinates: z.object({
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    }),
  }),
});

export const command = <Command>{
  name: '/owl-cep-search',
  description: 'Search for a CEP (Brazilian ZIP code)',
  uses: ['BrasilAPI'],
  listener: async (ctx) => {
    await ctx.ack();

    await ctx.respond({
      blocks: [
        {
          type: 'input',
          dispatch_action: true,
          element: {
            type: 'plain_text_input',
            action_id: 'owl-cep-search-input',
          },
          label: {
            type: 'plain_text',
            text: 'Type a CEP (e.g. `01001-000`)',
          },
        },
      ],
    });
  },
};

export const action = <Action>{
  id: 'owl-cep-search-input',
  listener: async (ctx) => {
    await ctx.ack();

    const cep = (ctx.action as PlainTextInputAction).value;
    if (!cepSchema.safeParse(cep).success) {
      await ctx.respond('Invalid CEP format. Use `XXXXX-XXX` (e.g. `01001-000`)');
      return;
    }

    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (!response.ok) {
      await ctx.respond('Failed to fetch CEP data');
      return;
    }

    const result = searchSchema.safeParse(await response.json());
    if (!result.success) {
      await ctx.respond('Failed to parse CEP data');
      return;
    }

    const mapUrl = new URL('https://www.openstreetmap.org');
    const { latitude, longitude } = result.data.location.coordinates;
    if (latitude && longitude) {
      mapUrl.searchParams.set('mlat', latitude);
      mapUrl.searchParams.set('mlon', longitude);
      mapUrl.hash = `map=15/${latitude}/${longitude}`;
    } else {
      mapUrl.searchParams.set(
        'query',
        `${result.data.street}, ${result.data.city}, ${result.data.state}`,
      );
    }

    await ctx.respond({
      blocks: <Block[]>[
        {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [{ type: 'text', text: 'CEP Search', style: { bold: true } }],
            },
          ],
        },
        createTableBlock(
          ['Field', 'Value'],
          [
            { Field: 'CEP', Value: result.data.cep },
            { Field: 'Street', Value: result.data.street },
            { Field: 'Neighborhood', Value: result.data.neighborhood },
            { Field: 'City', Value: result.data.city },
            { Field: 'State', Value: result.data.state },
          ],
        ),
        {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [{ type: 'text', text: 'Location', style: { bold: true } }],
            },
          ],
        },
        createTableBlock(
          ['Field', 'Value'],
          [
            { Field: 'Latitude', Value: latitude ?? 'N/A' },
            { Field: 'Longitude', Value: longitude ?? 'N/A' },
          ],
        ),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Open in OpenStreetMap' },
              url: mapUrl.toString(),
            },
          ],
        },
        { type: 'context', elements: [{ type: 'mrkdwn', text: `> Powered by BrasilAPI` }] },
      ],
    });
  },
};
