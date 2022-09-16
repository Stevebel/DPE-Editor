import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { regExpEscape } from '../parse-utils';
import { FunctionHandler, FunctionHandlerConfig } from './function-handler';

export type FunctionArrayHandlerConfig<T = string> = {
  definition?: string;
  functionConfig: FunctionHandlerConfig<T> | string;
  terminator?: string;
};

export class FunctionArrayHandler<T = string>
  implements SourceValueHandler<T[]>
{
  private readonly config: FunctionArrayHandlerConfig<T>;

  private definitionRe: RegExp;

  private lineRe: RegExp;

  private functionHandler?: FunctionHandler<T> | undefined;

  constructor(config: FunctionArrayHandlerConfig<T>) {
    this.config = config;

    this.definitionRe = new RegExp(
      `${
        regExpEscape(
          this.config.definition ? `${this.config.definition} = ` : ''
        ) +
        /\{\s*([\s\S]+?)/.source +
        (this.config.terminator
          ? `${regExpEscape(this.config.terminator)}\\s*,?`
          : '')
      }\\s*\\}`
    );

    const functionName =
      typeof this.config.functionConfig === 'string'
        ? this.config.functionConfig
        : this.config.functionConfig.functionName;
    this.lineRe =
      this.config.functionConfig === 'string'
        ? new RegExp(`${functionName + /\(\s*(\w+)\s*\)/.source}\\s*,?`, 'g')
        : new RegExp(`(${functionName + /\(.+?\)/.source})\\s*,?`, 'g');
    if (typeof this.config.functionConfig !== 'string') {
      this.functionHandler = new FunctionHandler(this.config.functionConfig);
    }
  }

  parse(source: string): ParseData<T[]> {
    const match = this.definitionRe.exec(source);
    if (!match) {
      throw new Error(`Could not find definition for ${this.definitionRe}`);
    }

    const data: T[] = [];
    const rawFunctions = match[1];
    let lineMatch: RegExpExecArray | null;
    while ((lineMatch = this.lineRe.exec(rawFunctions)) !== null) {
      if (typeof this.config.functionConfig === 'string') {
        const param = lineMatch[1];
        data.push(param as any);
      } else {
        data.push(this.functionHandler!.parse(lineMatch[1]).value);
      }
    }

    return {
      value: data,
      start: match.index,
      end: match.index + match[0].length,
    };
  }

  format(value: T[]): string {
    let out = `${
      this.config.definition ? `${this.config.definition} = ` : ''
    }{\n${value
      .map((v) => {
        if (typeof this.config.functionConfig === 'string') {
          return `\t${this.config.functionConfig}(${v}),\n`;
        }
        return `\t${this.functionHandler!.format(v)},\n`;
      })
      .join('')}`;
    if (this.config.terminator) {
      out += `\n\t${this.config.terminator}`;
    }
    out += '\n}';
    return out;
  }
}
