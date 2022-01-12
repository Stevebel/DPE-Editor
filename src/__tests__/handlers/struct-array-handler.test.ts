import { messageHandler } from '../../common/file-handlers/handlers/message-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import {
  StructIndexedArrayConfig,
  StructIndexedArrayHandler,
  structProp,
} from '../../common/file-handlers/handlers/struct-array-handler';
import { trimMultiline } from '../../common/test-utils';

describe('StructIndexedArrayHandler', () => {
  interface TestData {
    nationalDex: string;
    categoryName: string;
    height: number;
    weight: number;
  }
  const DEFAULT_CONFIG: StructIndexedArrayConfig<TestData> = {
    definition: 'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
    indexProperty: 'nationalDex',
    indexPrefix: 'NATIONAL_DEX_',
    structProps: [
      structProp('categoryName', messageHandler(12)),
      structProp('height', IntHandler),
      structProp('weight', IntHandler),
    ],
  };

  it('should sucessfully consruct', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    expect(handler).toBeTruthy();
  });
  it('should parse a struct indexed array', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    const result = handler.parse(
      `
      #include "defines.h"
      #include "../include/pokedex.h"
      #include "../include/text.h"

      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] =
      {
        [NATIONAL_DEX_NONE] =
        {
          .categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 1,
          .weight = 2,
        },
        [NATIONAL_DEX_BULBASAUR] ={
          .categoryName = {_S, _e, _e, _d, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 0x3,

          .weight = 0x4},
      };
    `
    );
    expect(result.value).toEqual([
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
    ]);
  });
  it('should throw an error if the struct has an unknown property', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    expect(() =>
      handler.parse(
        `
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {
        [NATIONAL_DEX_NONE] =
        {
          .height = 0x1,
          .weight = 0x2,
          .unknown = 0x3,
        },
      };
    `
      )
    ).toThrow();
  });
  it('should throw an error if the struct has an improperly formatted property', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    expect(() =>
      handler.parse(
        `
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {
        [NATIONAL_DEX_NONE] =
        {
          .height = 0x1,
          .weight: 0x2,
        },
      };
    `
      )
    ).toThrow();
  });

  it('should format a struct indexed array', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    const result = handler.format([
      {
        nationalDex: 'NONE',
        categoryName: 'Unknown',
        height: 0x1,
        weight: 0x2,
      },
      {
        nationalDex: 'BULBASAUR',
        categoryName: 'Seed',
        height: 0x3,
        weight: 0x4,
      },
    ]);
    expect(trimMultiline(result)).toBe(
      trimMultiline(
        `
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {
        [NATIONAL_DEX_NONE] =
        {
          .categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 1,
          .weight = 2,
        },
        [NATIONAL_DEX_BULBASAUR] =
        {
          .categoryName = {_S, _e, _e, _d, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 3,
          .weight = 4,
        },
      };
    `
      )
    );
  });

  it('should throw an error if the struct cannot be found', () => {
    const handler = new StructIndexedArrayHandler(DEFAULT_CONFIG);
    expect(() =>
      handler.parse(
        'const struct SomethingElse gSomethingElse[OTHER_COUNT] = {}'
      )
    ).toThrow();
  });
});
