import {
  ConstMappingArrayHandler,
  ConstMappingArrayHandlerConfig,
} from '../../common/file-handlers/handlers/const-mapping-array-handler';
import { trimMultiline } from '../../common/test-utils';

describe('ConstMappingArrayHandler', () => {
  type TestData = {
    species: string;
    nationalDex: string;
  };

  const SAMPLE_SOURCE = `
  const u16 gSpeciesToNationalPokedexNum[NUM_SPECIES - 1] = {
    [SPECIES_PIKACHU - 1] = NATIONAL_DEX_PIKACHU,
	  [SPECIES_RAICHU - 1] = NATIONAL_DEX_RAICHU,
    [SPECIES_PIKACHU_SURFING - 1] = NATIONAL_DEX_PIKACHU,
	  [SPECIES_PIKACHU_FLYING - 1] = NATIONAL_DEX_PIKACHU,
  };
  `;
  const SAMPLE_DATA: TestData[] = [
    { species: 'PIKACHU', nationalDex: 'PIKACHU' },
    { species: 'RAICHU', nationalDex: 'RAICHU' },
    { species: 'PIKACHU_SURFING', nationalDex: 'PIKACHU' },
    { species: 'PIKACHU_FLYING', nationalDex: 'PIKACHU' },
  ];

  const DEFAULT_CONFIG: ConstMappingArrayHandlerConfig<TestData> = {
    definition: 'const u16 gSpeciesToNationalPokedexNum[NUM_SPECIES - 1]',
    leftHandProperty: 'species',
    rightHandProperty: 'nationalDex',
    leftHandPrefix: 'SPECIES_',
    rightHandPrefix: 'NATIONAL_DEX_',
    leftAdd: -1,
    rightAdd: 0,
  };

  it('should parse a message', () => {
    const handler = new ConstMappingArrayHandler(DEFAULT_CONFIG);
    const result = handler.parse(SAMPLE_SOURCE);
    expect(result.value).toEqual(SAMPLE_DATA);
  });

  it('should format a message', () => {
    const handler = new ConstMappingArrayHandler(DEFAULT_CONFIG);
    const str = handler.format(SAMPLE_DATA);
    expect(trimMultiline(str)).toBe(trimMultiline(SAMPLE_SOURCE));
  });
});
