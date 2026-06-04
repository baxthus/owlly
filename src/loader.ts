// oxlint-disable no-await-in-loop
import fs from 'node:fs/promises';
import path from 'node:path';

import { Logger } from 'pino';

import { actionSchema } from '~/schemas/action';
import { commandSchema } from '~/schemas/command';

import { CustomApp } from '.';
import { logger } from './logger';

export class Loader {
  private readonly FOLDERS_TO_LOAD = ['commands'];
  private readonly EXPORT_TYPES = {
    command: { singular: 'command', plural: 'commands' },
    action: { singular: 'action', plural: 'actions' },
  };

  private log: Logger;
  private app: CustomApp;

  private readonly counts = { commands: 0, actions: 0 };

  public constructor(app: CustomApp) {
    this.log = logger.child({ source: 'loader' });
    this.app = app;
  }

  public async loadModules() {
    for (const folder of this.FOLDERS_TO_LOAD) {
      const folderPath = path.join(import.meta.dirname, folder);

      const files = await fs.readdir(folderPath);
      if (files.length === 0) continue;

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const exports = await import(filePath);

        // commands
        if (exports[this.EXPORT_TYPES.command.singular]) {
          this.registerCommand(exports[this.EXPORT_TYPES.command.singular], file);
        }
        if (
          exports[this.EXPORT_TYPES.command.plural] &&
          Array.isArray(exports[this.EXPORT_TYPES.command.plural])
        ) {
          for (const command of exports[this.EXPORT_TYPES.command.plural]) {
            this.registerCommand(command, file);
          }
        }

        // actions
        if (exports[this.EXPORT_TYPES.action.singular]) {
          this.registerAction(exports[this.EXPORT_TYPES.action.singular], file);
        }
        if (
          exports[this.EXPORT_TYPES.action.plural] &&
          Array.isArray(exports[this.EXPORT_TYPES.action.plural])
        ) {
          for (const action of exports[this.EXPORT_TYPES.action.plural]) {
            this.registerAction(action, file);
          }
        }
      }
    }

    this.log.info({ counts: this.counts }, 'Loaded modules');
  }

  private registerCommand(exports: unknown, file: string) {
    const command = commandSchema.safeParse(exports);
    if (!command.success) {
      this.log.error({ error: command.error, file }, 'Failed to parse command');
      return;
    }

    if (this.app.commands.some((c) => c.name === command.data.name)) {
      this.log.error({ name: command.data.name, file }, 'Duplicate command name');
      return;
    }

    this.app.command(command.data.name, command.data.listener);

    this.app.commands.push(command.data);
    this.counts.commands += 1;
  }

  private registerAction(exports: unknown, file: string) {
    const action = actionSchema.safeParse(exports);
    if (!action.success) {
      this.log.error({ error: action.error, file }, 'Failed to parse action');
      return;
    }

    if (this.app.actions.some((a) => a.id === action.data.id)) {
      this.log.error({ id: action.data.id, file }, 'Duplicate action id');
      return;
    }

    this.app.action(action.data.id, action.data.listener);

    this.app.actions.push(action.data);
    this.counts.actions += 1;
  }
}
