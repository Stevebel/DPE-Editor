import { isNumber } from 'lodash';
import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { KeyOfType } from '../parse-utils';
import { IntHandler } from './number-handlers';

export const DEFINE_BASE_RE = /#define\s+/g;
const DEFINE_NUMBER_END_RE = /(\w+)\s+([x0-9A-Fa-f]+)\s*$/g;

export type DefinesHandlerConfig<T> = {
  constPrefix: string;
  constProperty: KeyOfType<T, string>;
  numberProperty: KeyOfType<T, number>;
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
      const constName = match[1];
      const { value } = IntHandler.parse(match[2]);
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
    const num = item[this.config.numberProperty];
    if (isNumber(num)) {
      return num;
    }
    throw new Error('Number property is not a number');
  }
}
