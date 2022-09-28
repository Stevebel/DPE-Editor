import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { regExpEscape } from '../parse-utils';

export type IncListHandlerConfig = {
  label: string;
  itemPrefix: string;
};

export class IncListHandler implements SourceValueHandler<string[]> {
  private re: RegExp;

  constructor(private config: IncListHandlerConfig) {
    this.re = new RegExp(`${regExpEscape(config.itemPrefix || '')}(\\w+)`, 'g');
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<string[]> {
    const label = `${this.config.label}::`;
    const start = raw.indexOf(label);
    if (start === -1) {
      throw new Error(`Could not find label ${label}`);
    }

    const rawList = raw.substring(start);
    const data: string[] = [];
    let end = -1;
    let match: RegExpExecArray | null;
    while ((match = this.re.exec(rawList))) {
      data.push(match[1]);
      end = start + match.index + match[0].length;
    }
    if (end === -1) {
      end = 0;
    }

    return {
      start,
      end,
      value: data,
    };
  }

  format(value: string[]): string {
    return `${this.config.label}::\n${value
      .map((item) => `\t${this.config.itemPrefix}${item}`)
      .join('\n')}`;
  }
}
