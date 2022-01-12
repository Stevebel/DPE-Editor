import {
  DefineCountHandler,
  DefineCountHandlerConfig,
  DefinesHandler,
  DefinesHandlerConfig,
} from '../../common/file-handlers/handlers/defines-handler';
import { trimMultiline } from '../../common/test-utils';

describe('DefinesHandler', () => {
  type TestData = {
    species: string;
    number: number;
  };

  const DEFAULT_CONFIG: DefinesHandlerConfig<TestData> = {
    constPrefix: 'SPECIES_',
    constProperty: 'species',
    numberProperty: 'number',
  };

  const SAMPLE_SOURCE = `
    #define SPECIES_BULBASAUR 1
    #define SPECIES_IVYSAUR 2
    #define SPECIES_VENUSAUR 3
    `;
  const SAMPLE_DATA = [
    { species: 'BULBASAUR', number: 1 },
    { species: 'IVYSAUR', number: 2 },
    { species: 'VENUSAUR', number: 3 },
  ];

  const DEFAULT_CONFIG2: DefinesHandlerConfig<TestData> = {
    constPrefix: 'NATIONAL_DEX_',
    constProperty: 'species',
    numberProperty: 'number',
  };
  const SAMPLE_SOURCE2 = `
    #define NATIONAL_DEX_MEWTWO 150
    #define NATIONAL_DEX_MEW 151

    //Johto
    #define NATIONAL_DEX_CHIKORITA 152
  `;
  const SAMPLE_DATA2 = [
    { species: 'MEWTWO', number: 150 },
    { species: 'MEW', number: 151 },
    { species: 'CHIKORITA', number: 152 },
  ];

  it('should parse a message', () => {
    const handler = new DefinesHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should parse a different message', () => {
    const handler = new DefinesHandler(DEFAULT_CONFIG2);
    const result = handler.parse(SAMPLE_SOURCE2);
    expect(result.value).toEqual(SAMPLE_DATA2);
  });

  it('should format a message', () => {
    const handler = new DefinesHandler(DEFAULT_CONFIG);
    const str = handler.format(SAMPLE_DATA);
    expect(trimMultiline(str)).toBe(trimMultiline(SAMPLE_SOURCE));
  });

  it('should skip defines with different prefix', () => {
    const handler = new DefinesHandler(DEFAULT_CONFIG);
    const result = handler.parse(`
      ${SAMPLE_SOURCE}

      #define SPECIES_COUNT FINAL_SPECIES + 1
    `);
    expect(result.value).toEqual(SAMPLE_DATA);
  });
});

describe('DefineCountHandler', () => {
  const DEFAULT_CONFIG: DefineCountHandlerConfig = {
    constName: 'NUM_SPECIES',
  };

  const SAMPLE_SOURCE = `
    #define NUM_SPECIES (SPECIES_VENUSAUR + 1)
    `;
  const SAMPLE_DATA = 'SPECIES_VENUSAUR';

  it('should parse a message', () => {
    const handler = new DefineCountHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format a message', () => {
    const handler = new DefineCountHandler(DEFAULT_CONFIG);
    const str = handler.format(SAMPLE_DATA);
    expect(trimMultiline(str)).toBe(trimMultiline(SAMPLE_SOURCE));
  });

  it('should skip defines with different prefix', () => {
    const handler = new DefineCountHandler(DEFAULT_CONFIG);
    const result = handler.parse(`
      #define SPECIES_VENUSAUR 3

      ${SAMPLE_SOURCE}
    `);
    expect(result.value).toEqual(SAMPLE_DATA);
  });
});
