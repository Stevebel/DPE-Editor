import { EggMoves } from '../../common/file-handlers/files/egg-moves';
import {
  Evolution,
  Evolutions,
} from '../../common/file-handlers/files/evolution-table';
import { IconPalette } from '../../common/file-handlers/files/icon-palette-table';
import {
  ArrayHandler,
  ArrayHandlerConfig,
} from '../../common/file-handlers/handlers/array-handler';
import {
  ConstHandler,
  DefaultConstHandler,
  IntOrConstHandler,
} from '../../common/file-handlers/handlers/const-handler';
import {
  FunctionHandler,
  getListProp,
} from '../../common/file-handlers/handlers/function-handler';
import { messageHandler } from '../../common/file-handlers/handlers/message-handler';
import { IntHandler } from '../../common/file-handlers/handlers/number-handlers';
import {
  getProp,
  StructHandler,
} from '../../common/file-handlers/handlers/struct-handler';
import { trimMultiline } from '../../common/test-utils';

describe('ArrayHandler', () => {
  interface TestData {
    nationalDex: string;
    categoryName?: string;
    height?: number;
    weight?: number;
  }
  const DEFAULT_CONFIG: ArrayHandlerConfig<TestData> = {
    definition: 'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
    indexProperty: 'nationalDex',
    indexPrefix: 'NATIONAL_DEX_',
    itemHandler: new StructHandler({
      props: [
        getProp('categoryName', messageHandler(12)),
        getProp('height', IntHandler),
        getProp('weight', IntHandler),
      ],
    }),
  };

  const SAMPLE_SOURCE = `
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {
        [NATIONAL_DEX_NONE] = {
          .categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 1,
          .weight = 2,
        },
        [NATIONAL_DEX_BULBASAUR] = {
          .categoryName = {_S, _e, _e, _d, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE},
          .height = 3,
          .weight = 4,
        },
      }
    `;

  const SAMPLE_DATA: TestData[] = [
    {
      nationalDex: 'NONE',
      categoryName: 'Unknown',
      height: 1,
      weight: 2,
    },
    {
      nationalDex: 'BULBASAUR',
      categoryName: 'Seed',
      height: 3,
      weight: 4,
    },
  ];

  type TestDataWithoutIndex = {
    categoryName?: string;
    height?: number;
    weight?: number;
  };

  const DEFAULT_CONFIG_WITHOUT_NAMED_INDEX: ArrayHandlerConfig<TestDataWithoutIndex> =
    {
      definition:
        'const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT]',
      itemHandler: new StructHandler({
        props: [
          getProp('categoryName', messageHandler(12)),
          getProp('height', IntHandler),
          getProp('weight', IntHandler),
        ],
      }),
    };

  const SAMPLE_SOURCE_WITHOUT_NAMED_INDEX_AND_WITHOUT_DEFINITION = `{
      {
        .categoryName = {_U, _n, _k, _n, _o, _w, _n, _END, _SPACE, _SPACE, _SPACE, _SPACE},
        .height = 1,
        .weight = 2,
      },
      {
        .categoryName = {_S, _e, _e, _d, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE},
        .height = 3,
        .weight = 4,
      },
    }
  `;

  const SAMPLE_SOURCE_WITHOUT_NAMED_INDEX = `
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = ${SAMPLE_SOURCE_WITHOUT_NAMED_INDEX_AND_WITHOUT_DEFINITION}
    `;

  const SAMPLE_DATA_WITHOUT_NAMED_INDEX: TestDataWithoutIndex[] = [
    {
      categoryName: 'Unknown',
      height: 1,
      weight: 2,
    },
    {
      categoryName: 'Seed',
      height: 3,
      weight: 4,
    },
  ];

  const DEFAULT_CONFIG_BY_PROP: ArrayHandlerConfig<IconPalette> = {
    definition: 'const u8 gMonIconPaletteIndices[NUM_SPECIES]',
    indexProperty: 'species',
    indexPrefix: 'SPECIES_',
    propHandler: getProp('palette', IntHandler),
  };

  const SAMPLE_SOURCE_BY_PROP = `
    const u8 gMonIconPaletteIndices[NUM_SPECIES] = {
      [SPECIES_NONE] = 0,
      [SPECIES_BULBASAUR] = 1,
      [SPECIES_CHARMANDER] = 0,
    }
  `;

  const SAMPLE_DATA_BY_PROP: IconPalette[] = [
    {
      species: 'NONE',
      palette: 0,
    },
    {
      species: 'BULBASAUR',
      palette: 1,
    },
    {
      species: 'CHARMANDER',
      palette: 0,
    },
  ];

  it('should parse an indexed array', () => {
    const handler = new ArrayHandler<TestData>(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format an indexed array', () => {
    const handler = new ArrayHandler<TestData>(DEFAULT_CONFIG);
    const result = handler.format(SAMPLE_DATA);

    expect(trimMultiline(result)).toBe(trimMultiline(SAMPLE_SOURCE));
  });

  it('should parse an empty array', () => {
    const handler = new ArrayHandler<TestData>(DEFAULT_CONFIG);
    const result = handler.parse(`
      const struct PokedexEntry gPokedexEntries[NATIONAL_DEX_COUNT] = {}
    `);
    expect(result.value).toEqual([]);
  });

  it('should parse an array without named index', () => {
    const handler = new ArrayHandler<TestDataWithoutIndex>(
      DEFAULT_CONFIG_WITHOUT_NAMED_INDEX
    );
    const result = handler.parse(SAMPLE_SOURCE_WITHOUT_NAMED_INDEX);
    expect(result.value).toEqual(SAMPLE_DATA_WITHOUT_NAMED_INDEX);
  });

  it('should format an array without named index', () => {
    const handler = new ArrayHandler<TestDataWithoutIndex>(
      DEFAULT_CONFIG_WITHOUT_NAMED_INDEX
    );
    const result = handler.format(SAMPLE_DATA_WITHOUT_NAMED_INDEX);

    expect(trimMultiline(result)).toBe(
      trimMultiline(SAMPLE_SOURCE_WITHOUT_NAMED_INDEX)
    );
  });

  it('should parse an array without a definition', () => {
    const handler = new ArrayHandler<TestDataWithoutIndex>({
      ...DEFAULT_CONFIG_WITHOUT_NAMED_INDEX,
      definition: undefined,
    });
    const result = handler.parse(
      SAMPLE_SOURCE_WITHOUT_NAMED_INDEX_AND_WITHOUT_DEFINITION
    );

    expect(result.value).toEqual(SAMPLE_DATA_WITHOUT_NAMED_INDEX);
  });

  it('should format an array without a definition', () => {
    const handler = new ArrayHandler<TestDataWithoutIndex>({
      ...DEFAULT_CONFIG_WITHOUT_NAMED_INDEX,
      definition: undefined,
    });
    const result = handler.format(SAMPLE_DATA_WITHOUT_NAMED_INDEX);

    expect(trimMultiline(result)).toBe(
      trimMultiline(SAMPLE_SOURCE_WITHOUT_NAMED_INDEX_AND_WITHOUT_DEFINITION)
    );
  });

  it('should parse an array by prop', () => {
    const handler = new ArrayHandler(DEFAULT_CONFIG_BY_PROP);
    const result = handler.parse(SAMPLE_SOURCE_BY_PROP);
    expect(result.value).toEqual(SAMPLE_DATA_BY_PROP);
  });

  it('should format an array by prop', () => {
    const handler = new ArrayHandler(DEFAULT_CONFIG_BY_PROP);
    const result = handler.format(SAMPLE_DATA_BY_PROP);

    expect(trimMultiline(result)).toBe(trimMultiline(SAMPLE_SOURCE_BY_PROP));
  });

  it('should parse moves', () => {
    const handler = new ArrayHandler<EggMoves>({
      definition: 'const u16 gEggMoves[]',
      terminator: 'EGG_MOVES_TERMINATOR',
      itemHandler: new FunctionHandler<EggMoves>({
        functionName: 'egg_moves',
        parameterProps: [getProp('species', DefaultConstHandler)],
        restParametersProp: getListProp(
          'moves',
          new ConstHandler({ prefix: 'MOVE_' })
        ),
      }),
    });
    const result = handler.parse(`
      const u16 gEggMoves[] =
      {
        egg_moves(BULBASAUR,
          MOVE_SKULLBASH,
          MOVE_CHARM,
          MOVE_PETALDANCE,
          MOVE_MAGICALLEAF,
          MOVE_GRASSWHISTLE,
          MOVE_CURSE,
          MOVE_INGRAIN,
          MOVE_NATUREPOWER,
          MOVE_AMNESIA,
          MOVE_LEAFSTORM,
          MOVE_POWERWHIP,
          MOVE_SLUDGE,
          MOVE_ENDURE,
          MOVE_GIGADRAIN,
          MOVE_GRASSYTERRAIN),

        egg_moves(CHARMANDER,
          MOVE_BELLYDRUM,
          MOVE_ANCIENTPOWER,
          MOVE_BITE,
          MOVE_OUTRAGE,
          MOVE_BEATUP,
          MOVE_DRAGONDANCE,
          MOVE_CRUNCH,
          MOVE_DRAGONRUSH,
          MOVE_METALCLAW,
          MOVE_FLAREBLITZ,
          MOVE_COUNTER,
          MOVE_DRAGONPULSE,
          MOVE_FOCUSPUNCH,
          MOVE_AIRCUTTER),

          EGG_MOVES_TERMINATOR
      };`);

    expect(result.value).toEqual([
      {
        species: 'BULBASAUR',
        moves: [
          'SKULLBASH',
          'CHARM',
          'PETALDANCE',
          'MAGICALLEAF',
          'GRASSWHISTLE',
          'CURSE',
          'INGRAIN',
          'NATUREPOWER',
          'AMNESIA',
          'LEAFSTORM',
          'POWERWHIP',
          'SLUDGE',
          'ENDURE',
          'GIGADRAIN',
          'GRASSYTERRAIN',
        ],
      },
      {
        species: 'CHARMANDER',
        moves: [
          'BELLYDRUM',
          'ANCIENTPOWER',
          'BITE',
          'OUTRAGE',
          'BEATUP',
          'DRAGONDANCE',
          'CRUNCH',
          'DRAGONRUSH',
          'METALCLAW',
          'FLAREBLITZ',
          'COUNTER',
          'DRAGONPULSE',
          'FOCUSPUNCH',
          'AIRCUTTER',
        ],
      },
    ]);
  });

  it('should parse evolutions', () => {
    const handler = new ArrayHandler<Evolutions>({
      definition:
        'const struct Evolution gEvolutionTable[NUM_SPECIES][EVOS_PER_MON]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp(
        'evolutions',
        new ArrayHandler<Evolution>({
          itemHandler: new StructHandler({
            namedProps: false,
            props: [
              getProp('method', new ConstHandler({ prefix: 'EVO_' })),
              getProp('param', IntOrConstHandler),
              getProp(
                'targetSpecies',
                new ConstHandler({ prefix: 'SPECIES_' })
              ),
              getProp('extra', IntOrConstHandler),
            ],
          }),
        })
      ),
    });
    const result = handler.parse(`
    const struct Evolution gEvolutionTable[NUM_SPECIES][EVOS_PER_MON] =
    {
      [SPECIES_BULBASAUR] =        {{EVO_LEVEL, 16, SPECIES_IVYSAUR, 0}},
      [SPECIES_IVYSAUR] =          {{EVO_LEVEL, 32, SPECIES_VENUSAUR, 0}},
      [SPECIES_VENUSAUR] =         {{EVO_MEGA, ITEM_VENUSAURITE, SPECIES_VENUSAUR_MEGA, MEGA_VARIANT_STANDARD},
                      {EVO_GIGANTAMAX, TRUE, SPECIES_VENUSAUR_GIGA, 0}},
      [SPECIES_FEEBAS] =           {/*{EVO_BEAUTY, 0, SPECIES_MILOTIC, 0},*/
								  {EVO_ITEM, ITEM_PRISM_SCALE, SPECIES_MILOTIC, 0},
								  {EVO_TRADE_ITEM, ITEM_PRISM_SCALE, SPECIES_MILOTIC, 0}},
    }
    `);

    expect(result.value).toEqual([
      {
        species: 'BULBASAUR',
        evolutions: [
          {
            method: 'LEVEL',
            param: 16,
            targetSpecies: 'IVYSAUR',
            extra: 0,
          },
        ],
      },
      {
        species: 'IVYSAUR',
        evolutions: [
          {
            method: 'LEVEL',
            param: 32,
            targetSpecies: 'VENUSAUR',
            extra: 0,
          },
        ],
      },
      {
        species: 'VENUSAUR',
        evolutions: [
          {
            method: 'MEGA',
            param: 'ITEM_VENUSAURITE',
            targetSpecies: 'VENUSAUR_MEGA',
            extra: 'MEGA_VARIANT_STANDARD',
          },
          {
            method: 'GIGANTAMAX',
            param: 'TRUE',
            targetSpecies: 'VENUSAUR_GIGA',
            extra: 0,
          },
        ],
      },
      {
        species: 'FEEBAS',
        evolutions: [
          {
            method: 'ITEM',
            param: 'ITEM_PRISM_SCALE',
            targetSpecies: 'MILOTIC',
            extra: 0,
          },
          {
            method: 'TRADE_ITEM',
            param: 'ITEM_PRISM_SCALE',
            targetSpecies: 'MILOTIC',
            extra: 0,
          },
        ],
      },
    ]);
  });
});
