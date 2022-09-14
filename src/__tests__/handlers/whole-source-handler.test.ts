import { SourceFileDefinition } from '../../common/file-handlers/file-handler.interface';
import { ArrayHandler } from '../../common/file-handlers/handlers/array-handler';
import { messageHandler } from '../../common/file-handlers/handlers/message-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import {
  getProp,
  StructHandler,
} from '../../common/file-handlers/handlers/struct-handler';
import WholeSourceHandler from '../../common/file-handlers/handlers/whole-source-handler';
import { trimMultiline } from '../../common/test-utils';

describe('WholeSourceHandler', () => {
  interface TestData {
    nationalDex: string;
    categoryName: string;
    height: number;
    weight: number;
  }
  interface TestFile {
    test: TestData[];
  }
  const DEFAULT_SCHEMA: SourceFileDefinition<TestFile>['schema'] = {
    test: new ArrayHandler({
      definition:
        'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
      indexProperty: 'nationalDex',
      indexPrefix: 'NATIONAL_DEX_',
      itemHandler: new StructHandler({
        props: [
          getProp('categoryName', messageHandler(12)),
          getProp('height', IntHandler),
          getProp('weight', IntHandler),
        ],
      }),
    }),
  };

  const SAMPLE_FILE = `
      #include "defines.h"
      #include "../include/pokedex.h"
      #include "../include/text.h"

      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {
        [NATIONAL_DEX_NONE] = {
          .categoryName = _("Unknown"),
          .height = 1,
          .weight = 2,
        },
        [NATIONAL_DEX_BULBASAUR] = {
          .categoryName = _("Seed"),
          .height = 3,
          .weight = 4,
        },
      };

      EOF
    `;
  const SAMPLE: TestFile = {
    test: [
      {
        nationalDex: 'NONE',
        categoryName: 'Unknown',
        height: 1,
        weight: 2,
      },
      {
        nationalDex: 'BULBASAUR',
        categoryName: 'Seed',
        height: 0x3,
        weight: 0x4,
      },
    ],
  };

  it('should sucessfully consruct', () => {
    const handler = new WholeSourceHandler(DEFAULT_SCHEMA);
    expect(handler).toBeTruthy();
  });

  it('should parse a whole source file', () => {
    const handler = new WholeSourceHandler(DEFAULT_SCHEMA);
    const result = handler.parse(SAMPLE_FILE);

    expect(result.value).toEqual(SAMPLE);
  });

  it('should format a whole source file', () => {
    const handler = new WholeSourceHandler(DEFAULT_SCHEMA);
    // Need to populate source first
    handler.parse(SAMPLE_FILE);

    const result = handler.format(SAMPLE);
    expect(trimMultiline(result)).toBe(trimMultiline(SAMPLE_FILE));
  });
});
