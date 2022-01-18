import { ParseData, SourceValueHandler } from '../file-handler.interface';
import {
  closingBracketIndex,
  KeyOfType,
  nextCommaIndex,
  regExpEscape,
  setProperty,
} from '../parse-utils';
import { StructProp } from './struct-handler';

export type ArrayHandlerConfig<T> = {
  definition?: string;
  terminator?: string;
  indexProperty?: KeyOfType<T, string>;
  indexPrefix?: string;
  itemHandler?: SourceValueHandler<T>;
  propHandler?: StructProp<T>;
};

export class ArrayHandler<T> implements SourceValueHandler<T[]> {
  private definitionRe: RegExp;

  private bodyRe: RegExp;

  private indexRe?: RegExp;

  constructor(private config: ArrayHandlerConfig<T>) {
    this.definitionRe = config.definition
      ? new RegExp(`${regExpEscape(config.definition)}\\s*=\\s*\\{`)
      : /\{/;
    this.bodyRe = new RegExp(
      `([\\S\\s]*?)${regExpEscape(config.terminator || '')}\\s*$`
    );
    if (config.indexProperty) {
      this.indexRe = new RegExp(
        `\\[${config.indexPrefix || ''}(\\w+)\\]\\s*=\\s*`
      );
    } else if (!config.itemHandler) {
      throw new Error(
        'Must provide at least one of indexProperty or itemHandler'
      );
    }
    if (config.itemHandler && config.propHandler) {
      throw new Error('Cannot provide both itemHandler and propHandler');
    }
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<T[]> {
    const match = this.definitionRe.exec(raw);
    if (!match) {
      throw new Error(`Could not find definition: ${this.config.definition}`);
    }

    const start = match.index;
    const end = start + closingBracketIndex(raw.substring(start), '{', '}');

    let rawData = raw.substring(start + match[0].length, end);
    const bodyMatch = this.bodyRe.exec(rawData);
    if (!bodyMatch) {
      throw new Error(`Could not find terminator: ${this.config.terminator}`);
    }
    rawData = bodyMatch[1];

    const data: Array<T> = [];
    while (rawData.length > 0) {
      let rawItemEnd = nextCommaIndex(rawData);
      if (rawItemEnd === -1) {
        rawItemEnd = rawData.length;
      }
      let rawItem = rawData.substring(0, rawItemEnd).trim();
      if (rawItem.length > 0) {
        if (this.config.indexProperty) {
          const indexMatch = this.indexRe!.exec(rawItem);
          if (!indexMatch) {
            throw new Error(
              `Could not find index with prefix ${this.config.indexPrefix} in ${rawItem}`
            );
          }
          const index = indexMatch[1];
          const indexEnd = indexMatch.index + indexMatch[0].length;
          rawItem = rawItem.substring(indexEnd);
          let item: T = {} as T;
          if (this.config.itemHandler) {
            item = this.config.itemHandler.parse(rawItem).value;
          } else if (this.config.propHandler) {
            this.config.propHandler.parseAndApply(item, rawItem);
          }
          setProperty(item, this.config.indexProperty, index);
          data.push(item);
        } else if (this.config.itemHandler) {
          data.push(this.config.itemHandler.parse(rawItem).value);
        } else if (this.config.propHandler) {
          const item = {} as T;
          this.config.propHandler.parseAndApply(item, rawItem);
          data.push(item);
        }
      }
      rawData = rawData.substring(rawItemEnd + 1);
    }

    return {
      start,
      end: end + 1,
      value: data,
    };
  }

  format(value: T[]): string {
    const itemHandler = this.config.itemHandler || this.config.propHandler;
    if (!itemHandler) {
      throw new Error(
        'Must provide at least one of itemHandler or propHandler'
      );
    }
    return `
      ${this.config.definition ? `${this.config.definition} = ` : ''}{
        ${value
          .map((v) => {
            let out = '';
            if (this.config.indexProperty) {
              out += `[${this.config.indexPrefix}${
                v[this.config.indexProperty]
              }] = `;
            }
            out += `${itemHandler.format(v)},\n`;
            return out;
          })
          .join('')}
        ${this.config.terminator || ''}
      }`;
  }
}
