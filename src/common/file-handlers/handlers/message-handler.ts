import { SourceValueHandler } from '../file-handler.interface';

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

export function swap<T>(input: Map<T, T>): Map<T, T> {
  const out = new Map<T, T>();
  for (let entry of input) {
    out.set(entry[1], entry[0]);
  }
  return out;
}

export function messageHandler(fixedLength = 12): SourceValueHandler<string> {
  return {
    parse: (raw) => {
      const rawMsg = (WHOLE_MSG_RE.exec(raw) || ['', ''])[1].trim();
      if (!rawMsg) {
        throw new Error(`Could not find message in ${raw}`);
      }
      const symbols = rawMsg.split(SPLIT_MSG_RE);
      let str = '';
      for (let symbol of symbols) {
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
      if (value.length > fixedLength) {
        value = value.substring(0, fixedLength);
      }
      for (let char of value) {
        if (MSG_SYMBOL_REVERSE_MAPPING.has(char)) {
          symbols.push(MSG_SYMBOL_REVERSE_MAPPING.get(char)!);
        } else {
          symbols.push('_' + char);
        }
      }
      if (symbols.length < fixedLength) {
        symbols.push('_END');
        while (symbols.length < fixedLength) {
          symbols.push('_SPACE');
        }
      }
      return '{' + symbols.join(', ') + '}';
    },
  };
}
