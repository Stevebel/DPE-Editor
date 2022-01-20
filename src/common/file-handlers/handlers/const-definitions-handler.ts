import { KeyOfType, setProperty } from '../../ts-utils';
import { ParseData, SourceValueHandler } from '../file-handler.interface';
import { nextIndexOf, regExpEscape } from '../parse-utils';
import { StructProp } from './struct-handler';

export type ConstDefinitionHandlerConfig<T> = {
  definitionPrefix: string;
  indexProperty: KeyOfType<T, string>;
  definitionSuffix: string;
  itemHandler?: SourceValueHandler<T>;
  propHandler?: StructProp<T>;
};

export class ConstDefinitionHandler<T> implements SourceValueHandler<T[]> {
  private definitionRe: RegExp;

  constructor(private config: ConstDefinitionHandlerConfig<T>) {
    this.definitionRe = new RegExp(
      `${regExpEscape(config.definitionPrefix)}(\\w+)${regExpEscape(
        config.definitionSuffix
      )}\\s*=\\s*`
    );

    if (!config.itemHandler && !config.propHandler) {
      throw new Error('Must provide either itemHandler or propHandler');
    }
    if (config.itemHandler && config.propHandler) {
      throw new Error('Cannot provide both itemHandler and propHandler');
    }
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<T[]> {
    const data: T[] = [];

    let rawData = raw;
    let overallStart = raw.length + 1;
    let overallEnd = 0;
    while (rawData.length > 0) {
      const match = this.definitionRe.exec(rawData);
      if (!match) {
        break;
      }

      const index = match[1];
      const start = match.index;
      const end = start + nextIndexOf(rawData.substring(start), ';');

      const rawItem = rawData.substring(start + match[0].length, end);
      let item: T = {} as T;
      if (this.config.itemHandler) {
        item = this.config.itemHandler.parse(rawItem).value;
      } else if (this.config.propHandler) {
        this.config.propHandler.parseAndApply(item, rawItem);
      }
      setProperty(item, this.config.indexProperty, index);
      data.push(item);

      overallStart = Math.min(overallStart, start);
      overallEnd = Math.max(overallEnd, end);

      rawData = rawData.substring(end);
    }

    return {
      value: data,
      start: overallStart,
      end: overallEnd,
    };
  }

  format(data: T[]): string {
    const handler = this.config.itemHandler || this.config.propHandler;
    return data
      .map((item) => {
        const index = item[this.config.indexProperty];
        const raw = handler!.format(item);
        return `${this.config.definitionPrefix}${index}${this.config.definitionSuffix} = ${raw};\n`;
      })
      .join('\n');
  }
}
