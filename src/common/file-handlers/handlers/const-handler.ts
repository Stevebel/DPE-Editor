import { SourceValueHandler } from '../file-handler.interface';
import { HEX_RE, IntHandler, NUMBER_RE } from './number-handlers';

const CONST_RE = /([a-zA-Z_]\w*)/;

export type ConstHandlerConfig = {
  prefix?: string;
  suffix?: string;
};
export class ConstHandler<T extends string = string>
  implements SourceValueHandler<T>
{
  re: RegExp;

  prefix: string;

  suffix: string;

  constructor({ prefix, suffix }: ConstHandlerConfig) {
    this.prefix = prefix || '';
    this.suffix = suffix || '';
    this.re = new RegExp(`${this.prefix}${CONST_RE.source}${this.suffix}`);
  }

  parse(raw: string) {
    const match = this.re.exec(raw);
    if (!match) {
      throw new Error(`Could not parse ${raw} as a constant`);
    }

    return {
      start: match.index,
      end: match.index + match[0].length,
      value: match[1] as T,
    };
  }

  format(value: T) {
    return this.prefix + value + this.suffix;
  }
}

export const DefaultConstHandler = new ConstHandler({});

export const AddressOrConstHandler: SourceValueHandler<string | number> = {
  parse: (raw) => {
    let value: string | number | null = null;
    let start: number | null = null;

    let match: RegExpExecArray | null = HEX_RE.exec(raw);
    if (match) {
      value = parseInt(match[1], 16);
      start = match.index;
    } else {
      match = CONST_RE.exec(raw);
      if (match) {
        value = match[1];
        start = match.index;
      }
    }
    if (value === null || start == null || match == null) {
      throw new Error(`Could not parse ${raw} as an address or constant`);
    }

    return {
      start,
      end: start + match[0].length,
      value,
    };
  },
  format: (value) => {
    if (typeof value === 'string') {
      return value;
    }
    return `(const u8*) 0x${value.toString(16)}`;
  },
};

export const IntOrConstHandler: SourceValueHandler<string | number> = {
  parse: (raw) => {
    let value: string | number | null = null;
    let start: number | null = null;

    let match: RegExpExecArray | null = NUMBER_RE.exec(raw);
    if (match) {
      value = IntHandler.parse(match[0]).value;
      start = match.index;
    } else {
      match = CONST_RE.exec(raw);
      if (match) {
        value = match[1];
        start = match.index;
      }
    }
    if (value === null || start == null || match == null) {
      throw new Error(`Could not parse ${raw} as an address or constant`);
    }

    return {
      start,
      end: start + match[0].length,
      value,
    };
  },
  format: (value) => {
    if (typeof value === 'string') {
      return value;
    }
    return IntHandler.format(value);
  },
};
