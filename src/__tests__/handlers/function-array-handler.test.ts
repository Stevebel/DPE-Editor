import {
  FunctionArrayHandler,
  FunctionArrayHandlerConfig,
} from '../../common/file-handlers/handlers/function-array-handler';
import { trimMultiline } from '../../common/test-utils';

describe('FunctionArrayHandler', () => {
  const DEFAULT_CONFIG: FunctionArrayHandlerConfig = {
    definition: 'const struct AlternateDexEntries gAlternateDexEntries[]',
    functionConfig: 'ALTERNATE_ENTRY',
    terminator: '{SPECIES_TABLES_TERMIN, 0}',
  };

  const DEFAULT_SOURCE = `
    const struct AlternateDexEntries gAlternateDexEntries[] = {
      ALTERNATE_ENTRY(RATTATA_A),
      ALTERNATE_ENTRY(RATICATE_A),
      {SPECIES_TABLES_TERMIN, 0}
    }
  `;

  const DEFAULT_DATA = ['RATTATA_A', 'RATICATE_A'];

  it('should parse an array of functions', () => {
    const handler = new FunctionArrayHandler(DEFAULT_CONFIG);
    const data = handler.parse(DEFAULT_SOURCE);
    expect(data.value).toEqual(DEFAULT_DATA);
  });

  it('should format an array of functions', () => {
    const handler = new FunctionArrayHandler(DEFAULT_CONFIG);
    const formatted = handler.format(DEFAULT_DATA);
    expect(trimMultiline(formatted)).toEqual(trimMultiline(DEFAULT_SOURCE));
  });
});
