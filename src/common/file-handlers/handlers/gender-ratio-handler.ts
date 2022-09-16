import { SourceValueHandler } from '../file-handler.interface';

const GENDERLESS = 'MON_GENDERLESS';
const FEMALE = 'MON_FEMALE';
const MALE = 'MON_MALE';

const RATIO_RE = /PERCENT_FEMALE\(([\d.]+)\)/;

// eslint-disable-next-line import/prefer-default-export
export const GenderRatioHandler: SourceValueHandler<number> = {
  parse: (raw) => {
    let value: number;
    const trimmed = raw.trim();
    if (trimmed === GENDERLESS) {
      return {
        start: 0,
        end: raw.length,
        value: -1,
      };
    }
    if (trimmed === FEMALE) {
      return {
        start: 0,
        end: raw.length,
        value: 100,
      };
    }
    if (trimmed === MALE) {
      return {
        start: 0,
        end: raw.length,
        value: 0,
      };
    }
    const match = RATIO_RE.exec(raw);
    if (!match) {
      throw new Error(`Could not find Gender Ratio in ${raw}`);
    }
    try {
      value = parseFloat(match[1]);
    } catch (e) {
      throw new Error(`Couldn't parse number in Gender Ratio ${match[1]}`);
    }
    return {
      start: match.index,
      end: match.index + match[0].length,
      value,
    };
  },
  format: (value) => {
    if (value === -1) {
      return GENDERLESS;
    }
    if (value === 100) {
      return FEMALE;
    }
    if (value === 0) {
      return MALE;
    }
    return `PERCENT_FEMALE(${value.toLocaleString('en-US', {
      maximumFractionDigits: 1,
    })})`;
  },
};
