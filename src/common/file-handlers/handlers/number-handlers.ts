import { SourceValueHandler } from '../file-handler.interface';

export const HEX_RE = /0x([0-9A-F]+)/i;
export const DECIMAL_RE = /(\d+)/;

export const IntHandler: SourceValueHandler<number> = {
  parse: (raw) => {
    let value: number | null = null;
    let start: number | null = null;

    let match = HEX_RE.exec(raw);
    if (match) {
      value = parseInt(match[1], 16);
      start = match.index;
    } else {
      match = DECIMAL_RE.exec(raw);
      if (match) {
        value = parseInt(match[1], 10);
        start = match.index;
      }
    }
    if (value === null || start === null || match === null) {
      throw new Error(`Could not parse ${raw} as an integer`);
    }

    return {
      start,
      end: start + match[0].length,
      value,
    };
  },
  format: (value) => value.toString(10),
};

export const HexAddressHandler: SourceValueHandler<number> = {
  parse: (raw) => {
    let value: number | null = null;
    let start: number | null = null;

    const match = HEX_RE.exec(raw);
    if (match) {
      value = parseInt(match[1], 16);
      start = match.index;
    }
    if (value === null || start === null || match === null) {
      throw new Error(`Could not parse ${raw} as a hex address`);
    }

    return {
      start,
      end: start + match[0].length,
      value,
    };
  },
  format: (value) => `(const u8*) 0x${value.toString(16)}`,
};
