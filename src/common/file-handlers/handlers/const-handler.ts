import { SourceValueHandler } from '../file-handler.interface';
import { HEX_RE } from './number-handlers';

const CONST_RE = /\s*([a-zA-Z_]\w*)\s*/;
export const ConstHandler: SourceValueHandler<string> = {
  parse: (raw) => {
    const match = CONST_RE.exec(raw);
    if (!match) {
      throw new Error(`Could not parse ${raw} as a constant`);
    }

    return {
      start: match.index,
      end: match.index + match[0].length,
      value: match[1],
    };
  },
  format: (value) => value,
};

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
