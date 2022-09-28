import { getKeys } from '../../ts-utils';
import {
  ParseData,
  SourceFileDefinition,
  SourceValueHandler,
} from '../file-handler.interface';

export default class WholeSourceHandler<T> implements SourceValueHandler<T> {
  parseData: Partial<{
    [K in Extract<keyof T, string>]: ParseData<T[K]>;
  }> = {};

  source?: string;

  constructor(
    private schema: SourceFileDefinition<T>['schema'],
    private debug = false
  ) {}

  parse(raw: string) {
    this.source = raw;

    const out: T = {} as any;
    let start = Infinity;
    let end = -1;
    getKeys(this.schema).forEach((key) => {
      const handler = this.schema[key];
      if (handler) {
        console.log('Parsing', key);
        const data = handler.parse(raw);
        out[key] = data.value;
        this.parseData[key] = data;

        if (data.start < start) {
          start = data.start;
        }
        if (data.end > end) {
          end = data.end;
        }
      }
    });

    return {
      start,
      end,
      value: out,
    };
  }

  format(value: T): string {
    const { source } = this;
    if (!source) {
      throw new Error('Cannot format without source');
    }

    let out = '';
    const parseInfo = Object.entries(this.parseData) as Array<
      [keyof T, ParseData<any>]
    >;
    let lastSourceIndex = 0;
    // Iterate through the handled properties, filling in the gaps
    // with the text from the existing source file
    parseInfo
      .sort((a, b) => a[1].start - b[1].start)
      .forEach(([key, data]) => {
        if (this.debug) {
          console.log(
            `Adding ${key as string} from ${data.start} to ${data.end}`
          );
        }
        const inBetween = source.substring(lastSourceIndex, data.start);
        if (this.debug) {
          console.log('In-between', inBetween.slice(0, 300));
        }
        out += inBetween;
        const formatted = this.schema[key]?.format(value[key]);
        out += formatted;
        if (this.debug) {
          console.log('Formatting', key, formatted?.slice(0, 300));
        }
        lastSourceIndex = data.end;
      });
    if (lastSourceIndex < source.length) {
      out += source.substring(lastSourceIndex);
    }
    return out;
  }
}
