import { createEnv } from '@t3-oss/env-core';
import z from 'zod';

export const env = createEnv({
  server: {
    SLACK_APP_TOKEN: z.string().startsWith('xapp-'),
    SLACK_BOT_TOKEN: z.string().startsWith('xoxb-'),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
