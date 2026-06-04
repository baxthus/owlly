import fs from 'node:fs/promises';
import path from 'node:path';

import { App, StringIndexed } from '@slack/bolt';

import { commandSchema } from './schemas/command';

const COMMANDS_DIR = path.join(import.meta.dirname, 'commands');

export async function loadCommands(app: App<StringIndexed>) {
  const files = await fs.readdir(COMMANDS_DIR);

  for (const file of files) {
    // oxlint-disable-next-line no-await-in-loop
    const { default: raw } = await import(path.join(COMMANDS_DIR, file));
    const command = commandSchema.parse(raw);
    app.command(command.name, command.listener);
  }

  console.log(`Loaded ${files.length} commands`);
}
