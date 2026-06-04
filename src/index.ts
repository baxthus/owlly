import { App } from '@slack/bolt';

import { Command } from '~/schemas/command';

import { env } from './env';
import { loadCommands } from './loader';

export class CustomApp extends App {
  public commands: Array<Command> = [];
}

const app = new CustomApp({
  token: env.SLACK_BOT_TOKEN,
  appToken: env.SLACK_APP_TOKEN,
  socketMode: true,
});

await loadCommands(app);

await app.start();
console.log('Bot is running!');
