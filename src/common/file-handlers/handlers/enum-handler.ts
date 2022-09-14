import { ParseData, SourceValueHandler } from '../file-handler.interface';

/* Handles an enum definition in the following format:
 * enum {
 *    NATIONAL_DEX_NONE,
 *    NATIONAL_DEX_BULBASAUR,
 *    NATIONAL_DEX_IVYSAUR,
 *    NATIONAL_DEX_VENUSAUR,
 * };
 *
 * Translates to: ['NONE', 'BULBASAUR', 'IVYSAUR', 'VENUSAUR']
 */

export type EnumHandlerConfig = {
  itemPrefix?: string;
};

export class EnumHandler implements SourceValueHandler<string[]> {
  constructor(private config: EnumHandlerConfig) {}

  getConfig() {
    return this.config;
  }

  parse(raw: string): ParseData<string[]> {
    const enumRegex = new RegExp(
      `enum\\s*\\{\\s*(${this.config.itemPrefix || ''}[^}]*)\\s*\\}`
    );
    const match = enumRegex.exec(raw);
    if (!match) {
      throw new Error(`Could not parse ${raw} as an enum`);
    }
    const re = new RegExp(`\\s*${this.config.itemPrefix || ''}(\\w+)\\s*,?`);
    const rawEnums = match[1];
    const enums = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(rawEnums)) !== null) {
      enums.push(m[1]);
    }
    return {
      start: match.index,
      end: match.index + match[0].length,
      value: enums,
    };
  }

  format(value: string[]) {
    const enums = value.map((v) => `${this.config.itemPrefix || ''}${v}`);
    return `enum {
      ${enums.join(',\n\t')}
    }`;
  }
}
