import { SourceValueHandler } from '../file-handler.interface';

const GENDERLESS = 'MON_GENDERLESS';

const RATIO_RE = /PERCENT_FEMALE\(([\d.]+)\)/;

// eslint-disable-next-line import/prefer-default-export
export const GenderRatioHandler: SourceValueHandler<number> = {
  parse: (raw) => {
    let value: number;
    if (raw.trim() === GENDERLESS) {
      return {
        start: 0,
        end: raw.length,
        value: -1,
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
    return `PERCENT_FEMALE(${value.toLocaleString('en-US', {
      maximumFractionDigits: 1,
    })})`;
  },
};
