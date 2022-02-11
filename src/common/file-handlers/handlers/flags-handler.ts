import { ParseData, SourceValueHandler } from '../file-handler.interface';

export type FlagHandlerConfig = {
  itemPrefix?: string;
};

export class FlagHandler implements SourceValueHandler<string[]> {
  constructor(private config: FlagHandlerConfig) {}

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<string[]> {
    if (raw.trim() === '0') {
      return {
        start: 0,
        end: raw.length,
        value: [],
      };
    }
    const rawFlags = raw.split('|');
    const flags = rawFlags.map((flag) => {
      const re = new RegExp(`\\s*${this.config.itemPrefix || ''}(\\w+)\\s*`);
      const match = re.exec(flag);
      if (!match) {
        throw new Error(`Could not parse ${flag} as a flag`);
      }
      return match[1];
    });

    return {
      start: 0,
      end: raw.length,
      value: flags,
    };
  }

  format(value: string[]) {
    if (value.length === 0) {
      return '0';
    }
    return value
      .map((flag) => `${this.config.itemPrefix || ''}${flag}`)
      .join('|');
  }
}
