import { KeyOfType } from '../../ts-utils';
import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { closingBracketIndex, nextCommaIndex } from '../parse-utils';
import { StructProp } from './struct-handler';

export type FunctionHandlerConfig<T> = {
  functionName: string;
  parameterProps?: StructProp<T>[];
  restParametersProp?: ListProp<T>;
};

export type ListProp<T> = {
  key: keyof T;
  parseAndAdd: (data: T, raw: string) => void;
  format: (data: T) => string[];
};

export function getListProp<T, K extends KeyOfType<T, any[]>>(
  key: K,
  handler: SourceValueHandler<
    NonNullable<T[K] extends Array<infer U> ? U : never>
  >
): ListProp<T> {
  return {
    key,
    parseAndAdd: (data: T, raw: string) => {
      data[key] = (data[key] || []) as any;
      (data[key] as any).push(handler.parse(raw).value);
    },
    format: (data: T) => {
      const values: any[] | undefined = data[key] as any;
      if (values != null) {
        return values.map((v) => handler.format(v));
      }
      return [];
    },
  };
}

export class FunctionHandler<T> implements SourceValueHandler<T> {
  constructor(private config: FunctionHandlerConfig<T>) {}

  parse(raw: string): ParseData<T> {
    const match = new RegExp(`${this.config.functionName}\\(`, 'g').exec(raw);
    if (!match) {
      throw new Error(
        `Could not find function ${this.config.functionName} in ${raw}`
      );
    }

    const start = match.index;
    let end = -1;
    try {
      end = closingBracketIndex(raw.substring(start), '(', ')') + start;
    } catch (e) {
      throw new Error(`Could not find end of function ${raw}`);
    }

    let rawParams = raw.substring(start + match[0].length, end);
    const data: T = {} as any;
    let paramNum = 0;
    while (rawParams.length > 0) {
      let paramEnd = nextCommaIndex(rawParams);
      if (paramEnd === -1) {
        paramEnd = rawParams.length;
      }

      const rawParam = rawParams.substring(0, paramEnd).trim();
      if (rawParam.length > 0) {
        if (
          this.config.parameterProps &&
          paramNum < this.config.parameterProps?.length
        ) {
          this.config.parameterProps[paramNum].parseAndApply(data, rawParam);
        } else if (this.config.restParametersProp) {
          this.config.restParametersProp.parseAndAdd(data, rawParam);
        } else {
          throw new Error(
            `Could not find parameter ${paramNum} for function ${this.config.functionName}`
          );
        }
        paramNum += 1;
      }
      rawParams = rawParams.substring(paramEnd + 1);
    }

    return {
      value: data,
      start,
      end,
    };
  }

  format(data: T): string {
    let params = this.config.parameterProps
      ? this.config.parameterProps.map((p) => p.format(data))
      : [];
    if (this.config.restParametersProp) {
      params = params.concat(this.config.restParametersProp.format(data));
    }
    return `${this.config.functionName}(${params.join(
      params.length > 2 ? ', \n' : ', '
    )})`;
  }
}
