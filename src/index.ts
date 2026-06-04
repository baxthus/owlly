import { App } from '@slack/bolt';

import { env } from './env';
import { loadCommands } from './loader';

const app = new App({
  token: env.SLACK_BOT_TOKEN,
  appToken: env.SLACK_APP_TOKEN,
  socketMode: true,
});

await loadCommands(app);

await app.start();
console.log('Bot is running!');
