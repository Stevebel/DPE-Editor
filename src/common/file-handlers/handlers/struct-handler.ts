import { ParseData, SourceValueHandler } from '../file-handler.interface';
import {
  closingBracketIndex,
  nextCommaIndex,
  nextIndexOf,
} from '../parse-utils';

export type StructHandlerConfig<T> = {
  namedProps?: boolean;
  props: StructProp<T>[];
};

export type StructProp<T> = {
  key: keyof T;
  parseAndApply: (data: T, raw: string) => void;
  format: (data: T) => string;
};

export function getProp<T, K extends keyof T>(
  key: K,
  handler: SourceValueHandler<NonNullable<T[K]>>
): StructProp<T> {
  return {
    key,
    parseAndApply: (data: T, raw: string) => {
      data[key] = handler.parse(raw).value;
    },
    format: (data: T) => {
      const v = data[key];
      if (v != null) {
        return handler.format(v!);
      }
      return '';
    },
  };
}

const PROP_NAME_RE = /\s*\.(\w+)\s*=\s*/;

export class StructHandler<T> implements SourceValueHandler<T> {
  constructor(private config: StructHandlerConfig<T>) {}

  parse(raw: string): ParseData<T> {
    const data: T = {} as T;
    const start = nextIndexOf(raw, '{');
    const end = closingBracketIndex(raw.substring(start), '{', '}') + start;
    if (start === -1 || end === -1) {
      throw new Error(`Could not parse struct: ${raw}`);
    }
    let rawProps = raw.substring(start + 1, end);
    let i = 0;
    while (rawProps.length > 0) {
      let propEnd = nextCommaIndex(rawProps);
      if (propEnd === -1) {
        propEnd = rawProps.length;
      }
      const prop = rawProps.substring(0, propEnd);
      let propValue = prop;
      let propDef = this.config.props[i];
      if (this.config.namedProps === false || prop.trim() !== '0') {
        if (this.config.namedProps !== false) {
          const propNameMatch = PROP_NAME_RE.exec(prop);
          if (!propNameMatch) {
            throw new Error(`Could not find prop name in ${prop}`);
          }
          const foundDef = this.config.props.find(
            (p) => p.key === propNameMatch[1]
          );
          if (!foundDef) {
            throw new Error(
              `Could not find property definition for ${propNameMatch[1]}`
            );
          }
          propDef = foundDef;

          propValue = prop.substring(
            propNameMatch.index + propNameMatch[0].length
          );
        }
        propDef.parseAndApply(data, propValue);
      }

      rawProps = rawProps.substring(propEnd + 1).trim();
      i += 1;
    }

    return {
      start,
      end: end + 1,
      value: data,
    };
  }

  format(data: T): string {
    const props = this.config.props
      .map((p) => {
        const formattedProp = p.format(data);
        if (formattedProp.length > 0) {
          return `    ${
            this.config.namedProps !== false ? `.${p.key} = ` : ''
          }${formattedProp},\n`;
        }
        return '';
      })
      .join('');
    if (props.length > 0) {
      return `{
          ${props}
        }`;
    }
    return `{0}`;
  }
}
