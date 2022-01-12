import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { DefineCountHandlerConfig, DEFINE_BASE_RE } from './defines-handler';

const DEFINE_COUNT_ADD_ONE_END_RE = /\s+\(?(\w+)\s*\+\s*1\)?\s*/g;
const DEFINE_COUNT_END_RE = /\s+\(?(\w+)\s*\)?\s*/g;

export default class DefineCountHandler implements SourceValueHandler<string> {
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
