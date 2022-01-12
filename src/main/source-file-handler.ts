import { readFile, writeFile } from 'fs/promises';
import path from 'path/posix';

import { ParseData, SourceFileDefinition, SourceLocation } from '../common/file-handlers/file-handler.interface';
import { WholeSourceHandler } from '../common/file-handlers/handlers/whole-source-handler';

export type ParseInfo<T> = {
  [K in keyof T]: ParseData<T[K]>;
};

export class SourceFileHandler<T> {
  handlers: WholeSourceHandler<T>[];

  constructor(
    private definition: SourceFileDefinition<T>,
    private dpeFolder: string,
    private cfruFolder: string
  ) {
    this.handlers = definition.location.map(
      () => new WholeSourceHandler(definition.schema)
    );
  }

  getFileLocation(loc: SourceLocation) {
    if (loc.folder === 'cfru') {
      return path.join(this.cfruFolder, loc.fileName);
    } else if (loc.folder === 'dpe') {
      return path.join(this.dpeFolder, loc.fileName);
    }
    throw new Error(`Unknown folder ${loc.folder}`);
  }

  async load(): Promise<T> {
    const data = await Promise.all(
      this.definition.location.map(async (loc, i) => {
        console.log('Loading ' + this.getFileLocation(loc));
        const raw = await readFile(this.getFileLocation(loc), 'utf8');
        return this.handlers[i].parse(raw);
      })
    );
    try {
      return data[0].value;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async save(data: T) {
    return Promise.all(
      this.definition.location.map((loc, i) => {
        const source = this.handlers[i].format(data);
        return writeFile(this.getFileLocation(loc), source);
      })
    );
  }
}
