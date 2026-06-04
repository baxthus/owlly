import fs from 'node:fs/promises';
import path from 'node:path';

import { CustomApp } from '.';
import { commandSchema } from './schemas/command';

const COMMANDS_DIR = path.join(import.meta.dirname, 'commands');

export async function loadCommands(app: CustomApp) {
  const files = await fs.readdir(COMMANDS_DIR);

  for (const file of files) {
    // oxlint-disable-next-line no-await-in-loop
    const { default: raw } = await import(path.join(COMMANDS_DIR, file));
    const command = commandSchema.parse(raw);
    app.command(command.name, command.listener);
    app.commands.push(command);
  }

  console.log(`Loaded ${files.length} commands`);
}
