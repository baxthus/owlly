import { App } from '@slack/bolt';

import { Action } from '~/schemas/action';
import { Command } from '~/schemas/command';

import { env } from './env';
import { Loader } from './loader';
import { logger } from './logger';

export class CustomApp extends App {
  public commands: Array<Command> = [];
  public actions: Array<Action> = [];
}

export const app = new CustomApp({
  token: env.SLACK_BOT_TOKEN,
  appToken: env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  await new Loader(app).loadModules();

  await app.start();
  logger.info('Bot is running!');
})();
