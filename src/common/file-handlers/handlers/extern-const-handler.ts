import { ParseData, SourceValueHandler } from '../file-handler.interface';

const EXTERN_CONST_BASE_RE = /extern\s+const\s+u8\s+/g;
const EXTERN_CONST_END_RE = /\[\];/g;

export type ExternConstHandlerConfig = {
  constPrefix: string;
  constSuffix: string;
};

export class ExternConstHandler implements SourceValueHandler<string[]> {
  private re: RegExp;

  constructor(private config: ExternConstHandlerConfig) {
    this.re = new RegExp(
      `${EXTERN_CONST_BASE_RE.source + this.config.constPrefix}([\\w]+)${
        this.config.constSuffix
      }${EXTERN_CONST_END_RE.source}`,
      'g'
    );
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<string[]> {
    const data: string[] = [];
    let start = 9999999;
    let end = -1;
    let match: RegExpExecArray | null;
    while ((match = this.re.exec(raw))) {
      const constName = match[1];
      data.push(constName);

      start = Math.min(start, match.index);
      end = Math.max(end, match.index + match[0].length);
    }

    return {
      start,
      end,
      value: data,
    };
  }

  format(value: string[]): string {
    return value
      .map(
        (item) =>
          `extern const u8 ${this.getConfig().constPrefix}${item}${
            this.getConfig().constSuffix
          }[];`
      )
      .join('\n');
  }
}
