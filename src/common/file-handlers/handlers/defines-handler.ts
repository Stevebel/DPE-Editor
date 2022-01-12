import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { IntHandler } from './number-handlers';

const DEFINE_BASE_RE = /#define\s+/g;
const DEFINE_NUMBER_END_RE = /(\w+)\s+([x0-9A-Fa-f]+)\s*$/g;
const DEFINE_COUNT_ADD_ONE_END_RE = /\s+\(?(\w+)\s*\+\s*1\)?\s*/g;
const DEFINE_COUNT_END_RE = /\s+\(?(\w+)\s*\)?\s*/g;

export type DefinesHandlerConfig<T> = {
  constPrefix: string;
  constProperty: keyof T;
  numberProperty: keyof T;
};

export type DefineCountHandlerConfig = {
  constName: string;
  addOne?: boolean;
};

export class DefinesHandler<T> implements SourceValueHandler<T[]> {
  private re: RegExp;

  constructor(private config: DefinesHandlerConfig<T>) {
    this.re = new RegExp(
      DEFINE_BASE_RE.source +
        this.config.constPrefix +
        DEFINE_NUMBER_END_RE.source,
      'gm'
    );
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<T[]> {
    const data: T[] = [];
    let start = 9999999;
    let end = -1;
    let match: RegExpExecArray | null;
    while ((match = this.re.exec(raw))) {
      let constName = match[1];
      let value = IntHandler.parse(match[2]).value;
      data.push({
        [this.getConfig().constProperty]: constName,
        [this.config.numberProperty]: value,
      } as any);

      start = Math.min(start, match.index);
      end = Math.max(end, match.index + match[0].length);
    }

    return {
      start,
      end,
      value: data,
    };
  }

  format(value: T[]): string {
    return value
      .map(
        (item) =>
          `#define ${this.config.constPrefix}${
            item[this.config.constProperty]
          } ${IntHandler.format(this.getNumber(item))}\n`
      )
      .join('');
  }

  private getNumber(item: T): number {
    return item[this.config.numberProperty] as any;
  }
}

export class DefineCountHandler implements SourceValueHandler<string> {
  private re: RegExp;

  constructor(private config: DefineCountHandlerConfig) {
    this.re = new RegExp(
      DEFINE_BASE_RE.source +
        this.config.constName +
        (config.addOne === false
          ? DEFINE_COUNT_END_RE
          : DEFINE_COUNT_ADD_ONE_END_RE
        ).source,
      'g'
    );
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<string> {
    const match = this.re.exec(raw);
    if (!match) {
      return {
        start: -1,
        end: -1,
        value: '',
      };
    }

    return {
      start: match.index,
      end: match.index + match[0].length,
      value: match[1],
    };
  }

  format(value: string): string {
    if (this.config.addOne === false) {
      return `#define ${this.config.constName} ${value}`;
    }
    return `#define ${this.config.constName} (${value} + 1)`;
  }
}
