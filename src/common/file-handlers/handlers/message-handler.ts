import { SourceValueHandler } from '../file-handler.interface';

export function swap<T>(input: Map<T, T>): Map<T, T> {
  const out = new Map<T, T>();
  input.forEach((value, key) => out.set(value, key));
  return out;
}

const WHOLE_MSG_RE = /{(.+?)}/;
const SPLIT_MSG_RE = /\s*,\s*/;
const MSG_SYMBOL_MAPPING = new Map<string, string>([
  ['_SPACE', ' '],
  ['_NEWLINE', '\n'],
  ['_EXCLAMATION', '!'],
  ['_APOSTROPHE', `'`],
  ['_QUESION', '?'],
  ['_PERIOD', '.'],
  ['_HYPHEN', '-'],
]);
const MSG_SYMBOL_REVERSE_MAPPING = swap(MSG_SYMBOL_MAPPING);

export function messageHandler(fixedLength = 12): SourceValueHandler<string> {
  return {
    parse: (raw) => {
      const rawMsg = (WHOLE_MSG_RE.exec(raw) || ['', ''])[1].trim();
      if (!rawMsg) {
        throw new Error(`Could not find message in ${raw}`);
      }
      const symbols = rawMsg.split(SPLIT_MSG_RE);
      let str = '';
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        if (symbol === '_END') {
          break;
        } else if (MSG_SYMBOL_MAPPING.has(symbol)) {
          str += MSG_SYMBOL_MAPPING.get(symbol);
        } else if (symbol.length === 2) {
          str += symbol.substring(1);
        } else {
          str += '?';
        }
      }
      return {
        start: 0,
        end: raw.length,
        value: str,
      };
    },
    format: (value) => {
      const symbols: string[] = [];
      let val = value;
      if (val.length > fixedLength) {
        val = val.substring(0, fixedLength);
      }
      for (let i = 0; i < val.length; i++) {
        const char = val[i];
        if (MSG_SYMBOL_REVERSE_MAPPING.has(char)) {
          symbols.push(MSG_SYMBOL_REVERSE_MAPPING.get(char)!);
        } else {
          symbols.push(`_${char}`);
        }
      }
      if (symbols.length < fixedLength) {
        symbols.push('_END');
        while (symbols.length < fixedLength) {
          symbols.push('_SPACE');
        }
      }
      return `{${symbols.join(', ')}}`;
    },
  };
}
