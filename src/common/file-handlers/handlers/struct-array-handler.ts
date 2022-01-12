import { ParseData, SourceValueHandler } from '../file-handler.interface';
import {
  closingBracketIndex,
  nextCommaIndex,
  regExpEscape,
} from '../parse-utils';

export type StructIndexedArrayConfig<O> = {
  definition: string;
  indexProperty: keyof O;
  indexPrefix: string;
  structProps: StructProp<O, any>[];
};

export type StructProp<O, K extends keyof O> = {
  key: K;
  handler: SourceValueHandler<O[K]>;
};

export function structProp<O, K extends keyof O>(
  key: K,
  handler: SourceValueHandler<O[K]>
): StructProp<O, K> {
  return {
    key,
    handler,
  };
}

const PROP_NAME_RE = /\s*\.(\w+)\s*=\s*/;
export class StructIndexedArrayHandler<O>
  implements SourceValueHandler<Array<O>>
{
  private definitionRe: RegExp;

  private indexRe: RegExp;

  constructor(private config: StructIndexedArrayConfig<O>) {
    this.definitionRe = new RegExp(
      `${regExpEscape(config.definition).replace(/\s+/g, '\\s+')}\\s*=\\s*\\{`
    );
    this.indexRe = new RegExp(`\\[${config.indexPrefix}(\\w+)\\]\\s*=\\s*`);
  }

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<Array<O>> {
    const match = this.definitionRe.exec(raw);
    if (!match) {
      throw new Error(`Could not find definition: ${this.config.definition}`);
    }

    const start = match.index;
    const end = start + closingBracketIndex(raw.substring(start), '{', '}');

    let rawData = raw.substring(start + match[0].length, end);
    const data: Array<O> = [];
    while (rawData.length > 0) {
      const propsMatch = this.indexRe.exec(rawData);
      if (!propsMatch) {
        break;
      }
      rawData = rawData.substring(propsMatch.index + propsMatch[0].length);
      const propsEnd = closingBracketIndex(rawData, '{', '}');

      let rawProps = rawData.substring(1, propsEnd).trim();
      const item: O = {
        [this.getConfig().indexProperty]: propsMatch[1],
      } as any;
      while (rawProps.length > 0) {
        let propEnd = nextCommaIndex(rawProps);
        if (propEnd === -1) {
          propEnd = rawProps.length;
        }
        const prop = rawProps.substring(0, propEnd);

        const propNameMatch = PROP_NAME_RE.exec(prop);
        if (!propNameMatch) {
          throw new Error(`Could not find prop name in ${prop}`);
        }
        const propDef = this.config.structProps.find(
          (p) => p.key === propNameMatch[1]
        );
        if (!propDef) {
          throw new Error(
            `Could not find property definition for ${propNameMatch[1]}`
          );
        }

        const propValue = prop.substring(
          propNameMatch.index + propNameMatch[0].length
        );
        item[propDef.key as keyof O] = propDef.handler.parse(propValue).value;

        rawProps = rawProps.substring(propEnd + 1);
      }
      data.push(item);
    }

    return {
      start,
      end: end + 2,
      value: data,
    };
  }

  format(value: Array<O>): string {
    let out = `${this.config.definition} = {\n`;
    value.forEach((item) => {
      out += `  [${this.config.indexPrefix}${
        item[this.config.indexProperty]
      }] = \n  {\n`;
      out += this.config.structProps
        .map(
          (p) =>
            `    .${p.key} = ${p.handler.format(item[p.key as keyof O])},\n`
        )
        .join('');
      out += '  },\n';
    });
    out += '};';
    return out;
  }
}
