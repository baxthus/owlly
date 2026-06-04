import fs from 'node:fs/promises';
import path from 'node:path';

import { CustomApp } from '.';
import { logger } from './logger';
import { commandSchema } from './schemas/command';

const log = logger.child({ source: 'loader' });

const COMMANDS_DIR = path.join(import.meta.dirname, 'commands');

export async function loadCommands(app: CustomApp) {
  const files = await fs.readdir(COMMANDS_DIR);

  for (const file of files) {
    // oxlint-disable-next-line no-await-in-loop
    const { default: raw } = await import(path.join(COMMANDS_DIR, file));
    const command = commandSchema.safeParse(raw);
    if (!command.success) {
      log.error({ file, error: command.error }, 'Failed to parse command');
      continue;
    }

    app.command(command.data.name, command.data.listener);
    app.commands.push(command.data);
  }

  log.info({ count: files.length }, 'Commands loaded');
}
