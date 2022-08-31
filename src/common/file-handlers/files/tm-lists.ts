import { readdir, readFile } from 'fs/promises';
import path from 'path';

export interface TMCompatibilityList {
  tmNumber: number;
  tmName: string;
  species: string[];
}

interface TMFile {
  fileName: string;
  contents: string;
}

const TMFolder = 'src/tm_compatibility';

export class TMListsHandler {
  constructor(private dpeFolder: string) {}

  async getTMFiles(): Promise<TMFile[]> {
    // Get all the files in the TM folder
    const folder = path.join(this.dpeFolder, TMFolder);
    const files = await readdir(folder);

    return Promise.all(
      files.map(async (file) => {
        const contents = await readFile(path.join(folder, file), 'utf8');
        return { fileName: file, contents };
      })
    );
  }

  async read(): Promise<TMCompatibilityList[]> {
    const files = await this.getTMFiles();
    console.log(files.map((file) => file.fileName));
    return files
      .map((file) => {
        const [tmNumberRaw, tmName] = file.fileName.split(' - ');
        const tmNumber = parseInt(tmNumberRaw, 10);
        const lines = file.contents.split('\n');
        // Remove the header line
        lines.shift();
        return {
          tmNumber,
          tmName,
          species: lines.map((line) => line.trim()),
        };
      })
      .sort((a, b) => a.tmNumber - b.tmNumber);
  }
}
