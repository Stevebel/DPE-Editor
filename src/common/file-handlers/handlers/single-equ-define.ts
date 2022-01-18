import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { IntHandler } from './number-handlers';

export type SingleEquDefineConfig = {
  constName: string;
};

export class SingleEquDefineHandler implements SourceValueHandler<number> {
  private re: RegExp;

  constructor(private config: SingleEquDefineConfig) {
    this.re = new RegExp(
      `\\.equ\\s+${config.constName}\\s*,\\s*([x0-9a-fA-F]+)`,
      'g'
    );
  }

  parse(raw: string): ParseData<number> {
    const match = this.re.exec(raw);
    if (!match) {
      throw new Error(`Could not find .equ ${this.config.constName}`);
    }
    const { value } = IntHandler.parse(match[1]);
    return {
      value,
      start: match.index,
      end: match.index + match[0].length,
    };
  }

  format(value: number): string {
    return `.equ ${this.config.constName}, ${IntHandler.format(value)}`;
  }
}
