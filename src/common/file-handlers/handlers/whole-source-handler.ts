import { ParseData, SourceFileDefinition, SourceValueHandler } from '../file-handler.interface';

export class WholeSourceHandler<T> implements SourceValueHandler<T> {
  private parseData: { [K in Extract<keyof T, string>]: ParseData<T[K]> } =
    {} as any;
  source?: string;

  constructor(private schema: SourceFileDefinition<T>['schema']) {}

  parse(raw: string) {
    this.source = raw;

    const out: T = {} as any;
    let start = Infinity;
    let end = -1;
    for (let key in this.schema) {
      console.log(`...Parsing ${key}`);
      const handler = this.schema[key];
      if (handler) {
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
    }

    return {
      start: start,
      end: end,
      value: out,
    };
  }
  format(value: T): string {
    if (!this.source) {
      throw new Error('Cannot format without source');
    }

    let out = '';
    let parseInfo = Object.entries(this.parseData) as Array<
      [keyof T, ParseData<any>]
    >;
    let lastSourceIndex = 0;
    // Iterate through the handled properties, filling in the gaps
    // with the text from the existing source file
    parseInfo
      .sort((a, b) => a[1].start - b[1].start)
      .forEach(([key, data]) => {
        out += this.source!.substring(lastSourceIndex, data.start);
        out += this.schema[key]!.format(value[key]);
        lastSourceIndex = data.end;
      });
    if (lastSourceIndex < this.source.length) {
      out += this.source.substring(lastSourceIndex);
    }
    return out;
  }
}
