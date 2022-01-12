import { escapeRegExp } from 'lodash';

import { ParseData, SourceValueHandler } from '../file-handler.interface';

export type ConstMappingArrayHandlerConfig<T> = {
  definition: string;
  leftHandProperty: keyof T;
  rightHandProperty: keyof T;
  leftHandPrefix: string;
  rightHandPrefix: string;
  leftAdd: number;
  rightAdd: number;
};

export class ConstMappingArrayHandler<T> implements SourceValueHandler<T[]> {
  private readonly config: ConstMappingArrayHandlerConfig<T>;
  private definitionRe: RegExp;
  private lineRe: RegExp;

  constructor(config: ConstMappingArrayHandlerConfig<T>) {
    this.config = config;

    this.definitionRe = new RegExp(
      escapeRegExp(this.config.definition) + /\s*=\s*\{\s*([\s\S]+?)\}/.source
    );

    const leftHand =
      escapeRegExp('[' + this.config.leftHandPrefix) +
      /(\w+)/.source +
      escapeRegExp(this.getAddition(this.config.leftAdd) + ']');
    const rightHand =
      this.config.rightHandPrefix +
      /(\w+)/.source +
      this.getAddition(this.config.rightAdd);

    this.lineRe = new RegExp(
      leftHand + /\s*=\s*/.source + rightHand + '\\s*,?',
      'g'
    );
  }

  private getAddition(amount: number) {
    return amount === 0 ? '' : amount > 0 ? ` + ${amount}` : ` - ${-amount}`;
  }

  parse(source: string): ParseData<T[]> {
    const match = this.definitionRe.exec(source);
    if (!match) {
      throw new Error(
        `Could not find definition for ${this.config.definition}`
      );
    }

    const data: T[] = [];
    const rawMappings = match[1];
    let lineMatch: RegExpExecArray | null;
    while ((lineMatch = this.lineRe.exec(rawMappings))) {
      const left = lineMatch[1];
      const right = lineMatch[2];

      data.push({
        [this.config.leftHandProperty]: left,
        [this.config.rightHandProperty]: right,
      } as any);
    }

    return {
      value: data,
      start: match.index,
      end: match[0].length + match.index,
    };
  }

  format(value: T[]): string {
    return `${this.config.definition} = {
      ${value
        .map(
          (item) =>
            `[${this.config.leftHandPrefix}${
              item[this.config.leftHandProperty]
            }${this.getAddition(this.config.leftAdd)}] = ${
              this.config.rightHandPrefix
            }${item[this.config.rightHandProperty]}${this.getAddition(
              this.config.rightAdd
            )},`
        )
        .join('\n')}
    };`;
  }
}
