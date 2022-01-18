import {
  ExternConstHandler,
  ExternConstHandlerConfig,
} from '../../common/file-handlers/handlers/extern-const-handler';
import { trimMultiline } from '../../common/test-utils';

describe('ExternConstHandler', () => {
  const DEFAULT_CONFIG: ExternConstHandlerConfig = {
    constPrefix: 'gFrontSprite',
    constSuffix: 'Tiles',
  };

  const SAMPLE_SOURCE = `
    extern const u8 gFrontSprite001BulbasaurTiles[];
  extern const u8 gFrontSprite002IvysaurTiles[];
  extern const u8 gFrontSprite003VenusaurTiles[];
  `;
  const SAMPLE_DATA = ['001Bulbasaur', '002Ivysaur', '003Venusaur'];

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

      extern const u8 gBackShinySprite001BulbasaurTiles[];
    `);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should skip defines with different suffix', () => {
    const handler = new ExternConstHandler(DEFAULT_CONFIG);
    const result = handler.parse(`
      ${SAMPLE_SOURCE}

      extern const u8 gFrontSprite001BulbasaurPal[];
    `);
    expect(result.value).toEqual(SAMPLE_DATA);
  });
});
