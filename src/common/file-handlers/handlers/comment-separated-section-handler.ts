import { ParseData, SourceValueHandler } from '../file-handler.interface';

export type CommentSeparatedSectionConfig<T> = {
  startComment?: string;
  endComment?: string;
  outputComment?: boolean;
  handler: SourceValueHandler<T>;
};

export class CommentSeparatedSectionHandler<T>
  implements SourceValueHandler<T>
{
  constructor(private config: CommentSeparatedSectionConfig<T>) {
    if (!config.startComment && !config.endComment) {
      throw new Error('Must provide either startComment or endComment');
    }
  }

  get startComment() {
    return this.config.startComment
      ? `// ${this.config.startComment}`
      : undefined;
  }

  get endComment() {
    return this.config.endComment ? `// ${this.config.endComment}` : undefined;
  }

  parse(raw: string): ParseData<T> {
    let start = null;
    let end = null;
    let dataStart = 0;
    let dataEnd = raw.length;
    if (this.startComment) {
      const startMatch = raw.indexOf(this.startComment);
      if (startMatch === -1) {
        throw new Error(`Could not find start comment: ${this.startComment}`);
      }
      if (this.config.outputComment) {
        start = startMatch;
      }
      dataStart = startMatch + this.startComment.length;
    }
    if (this.endComment) {
      const endMatch = raw.indexOf(this.endComment, dataStart);
      if (endMatch === -1) {
        throw new Error(`Could not find end comment: ${this.endComment}`);
      }
      if (this.config.outputComment) {
        end = endMatch + this.endComment.length;
      }
      dataEnd = endMatch;
    }
    const rawData = raw.substring(dataStart, dataEnd);
    const parsed = this.config.handler.parse(rawData);
    return {
      start: start != null ? start : dataStart + parsed.start,
      end: end != null ? end : dataStart + parsed.end,
      value: parsed.value,
    };
  }

  format(data: T): string {
    const formatted = this.config.handler.format(data);
    if (this.config.outputComment) {
      if (formatted.length === 0) {
        return this.startComment || this.endComment || '';
      }
      return `\n${this.startComment || ''}\n${formatted}\n${
        this.endComment || ''
      }`;
    }
    return formatted;
  }
}
