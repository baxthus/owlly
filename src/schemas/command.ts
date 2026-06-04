import type { AllMiddlewareArgs, StringIndexed, SlackCommandMiddlewareArgs } from '@slack/bolt';
import z from 'zod';

export const commandSchema = z.object({
  name: z.templateLiteral(['/owl-', z.string()]),
  listener: z.function({
    input: [z.custom<SlackCommandMiddlewareArgs & AllMiddlewareArgs<StringIndexed>>()],
    output: z.promise(z.void()),
  }),
});
export type Command = z.infer<typeof commandSchema>;
