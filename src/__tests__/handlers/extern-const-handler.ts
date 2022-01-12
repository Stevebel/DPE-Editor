import {
  ExternConstHandler,
  ExternConstHandlerConfig,
} from '../../common/file-handlers/handlers/extern-const-handler';
import { trimMultiline } from '../../common/test-utils';

describe('ExternConstHandler', () => {
  const DEFAULT_CONFIG: ExternConstHandlerConfig = {
    constPrefix: 'DEX_ENTRY_',
  };

  const SAMPLE_SOURCE = `
    extern const u8 DEX_ENTRY_TURTWIG[];
    extern const u8 DEX_ENTRY_GROTLE[];
    extern const u8 DEX_ENTRY_TORTERRA[];
  `;
  const SAMPLE_DATA = ['TURTWIG', 'GROTLE', 'TORTERRA'];

  it('should parse a list of external consts', () => {
    const handler = new ExternConstHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format a list of external consts', () => {
    const handler = new ExternConstHandler(DEFAULT_CONFIG);
    const str = handler.format(SAMPLE_DATA);
    expect(trimMultiline(str)).toBe(trimMultiline(SAMPLE_SOURCE));
  });

  it('should skip defines with different prefix', () => {
    const handler = new ExternConstHandler(DEFAULT_CONFIG);
    const result = handler.parse(`
      ${SAMPLE_SOURCE}

      extern const u8 OTHER_CONST[];
    `);
    expect(result.value).toEqual(SAMPLE_DATA);
  });
});
