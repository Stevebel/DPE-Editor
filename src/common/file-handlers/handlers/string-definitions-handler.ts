import { ParseData, SourceValueHandler } from '../file-handler.interface';

export type StringDefinitionsConfig<T> = {
  constProperty: keyof T;
  constPrefix: string;
  stringProperty: keyof T;
};

const ESCAPED_NEW_LINE_RE = /\\n/g;
const ESCAPED_ACCENTED_E_RE = /\\e/g;

export class StringDefinitionsHandler<T> implements SourceValueHandler<T[]> {
  private stringDefinitionRe: RegExp;

  constructor(private config: StringDefinitionsConfig<T>) {
    this.stringDefinitionRe = new RegExp(
      `#org @${config.constPrefix}(\\w+)\\s*\\n\\s*([^#\\n]+)\\s*`,
      'g'
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
    while ((match = this.stringDefinitionRe.exec(raw))) {
      let pointerConst = match[1];
      let str = match[2]
        .replace(ESCAPED_NEW_LINE_RE, '\n')
        .replace(ESCAPED_ACCENTED_E_RE, 'é');
      data.push({
        [this.getConfig().constProperty]: pointerConst,
        [this.getConfig().stringProperty]: str,
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
          `#org @${this.config.constPrefix}${
            item[this.config.constProperty]
          }\n${this.getString(item)
            .replace(/\n/g, '\\n')
            .replace(/é/g, '\\e')}\n\n`
      )
      .join('');
  }

  private getString(item: T): string {
    return item[this.config.stringProperty] as any;
  }
}
