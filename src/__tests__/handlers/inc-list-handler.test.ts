import {
  IncListHandler,
  IncListHandlerConfig,
} from '../../common/file-handlers/handlers/inc-list-handler';
import { trimMultiline } from '../../common/test-utils';

describe('IncListHandler', () => {
  const DEFAULT_CONFIG: IncListHandlerConfig = {
    label: 'gCryTable',
    itemPrefix: 'cry Cry_',
  };

  const SAMPLE_SOURCE = `
    gCryTable::
      cry Cry_Bulbasaur
      cry Cry_Ivysaur
      cry Cry_Venusaur
    gCryTable_Reverse::
      cry_reverse Cry_Charmander`.trim();
  const SAMPLE_DATA = ['Bulbasaur', 'Ivysaur', 'Venusaur'];
  const SAMPLE_FORMATTED = SAMPLE_SOURCE.substring(
    0,
    SAMPLE_SOURCE.indexOf('gCryTable_Reverse')
  ).trim();

  it('should parse an inc list', () => {
    const handler = new IncListHandler(DEFAULT_CONFIG);
    const data = handler.parse(SAMPLE_SOURCE);
    expect(data.value).toEqual(SAMPLE_DATA);
    expect(data.start).toEqual(0);
    expect(data.end).toEqual(SAMPLE_FORMATTED.length);
  });

  it('should format an inc list', () => {
    const handler = new IncListHandler(DEFAULT_CONFIG);
    const formatted = handler.format(SAMPLE_DATA);
    expect(trimMultiline(formatted)).toEqual(trimMultiline(SAMPLE_FORMATTED));
  });
});
