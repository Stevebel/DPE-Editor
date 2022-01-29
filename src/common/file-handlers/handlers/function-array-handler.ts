import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { regExpEscape } from '../parse-utils';

export type FunctionArrayHandlerConfig = {
  definition: string;
  functionName: string;
  terminator: string;
};

export class FunctionArrayHandler implements SourceValueHandler<string[]> {
  private readonly config: FunctionArrayHandlerConfig;

  private definitionRe: RegExp;

  private lineRe: RegExp;

  constructor(config: FunctionArrayHandlerConfig) {
    this.config = config;

    this.definitionRe = new RegExp(
      `${
        regExpEscape(this.config.definition) +
        /\s*=\s*\{\s*([\s\S]+?)/.source +
        regExpEscape(this.config.terminator)
      }\\s*\\}`
    );

    this.lineRe = new RegExp(
      `${this.config.functionName + /\(\s*(\w+)\s*\)/.source}\\s*,?`,
      'g'
    );
  }

  parse(source: string): ParseData<string[]> {
    const match = this.definitionRe.exec(source);
    if (!match) {
      throw new Error(
        `Could not find definition for ${this.config.definition}`
      );
    }

    const data: string[] = [];
    const rawFunctions = match[1];
    let lineMatch: RegExpExecArray | null;
    while ((lineMatch = this.lineRe.exec(rawFunctions))) {
      const param = lineMatch[1];

      data.push(param);
    }

    return {
      value: data,
      start: match.index,
      end: match.index + match[0].length,
    };
  }

  format(value: string[]): string {
    return `${this.config.definition} = {\n${value
      .map((v) => `\t${this.config.functionName}(${v}),\n`)
      .join('')}\n\t${this.config.terminator}\n}`;
  }
}
