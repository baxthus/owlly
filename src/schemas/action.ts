import {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
  StringIndexed,
} from '@slack/bolt';
import z from 'zod';

export const actionSchema = z.object({
  id: z.templateLiteral(['owl-', z.string(), '-', z.enum(['button'])]),
  listener: z.function({
    input: [z.custom<SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs<StringIndexed>>()],
    output: z.promise(z.void()),
  }),
});
export type Action = z.infer<typeof actionSchema>;
