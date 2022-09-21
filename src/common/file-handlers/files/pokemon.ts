import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type PokemonConsts = {
  speciesToHoennPokedexNum: string[];
  speciesToNationalPokedexNum: NationalDexMapping[];
  hoennToNationalOrder: string[];
  frontAnimIds: AnimId[];
  animationDelays: SpeciesNumber[];
};

export type NationalDexMapping = {
  speciesConst: string;
  nationalDexConst: string;
};

export type AnimId = {
  speciesConst: string;
  anim: string;
};

export type SpeciesNumber = {
  speciesConst: string;
  num: number;
};

export const PokemonConstsSourceDef: SourceFileDefinition<PokemonConsts> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/pokemon.c',
    },
  ],
  schema: {
    speciesToHoennPokedexNum: new FunctionArrayHandler({
      definition: 'static const u16 sSpeciesToHoennPokedexNum[NUM_SPECIES - 1]',
      functionConfig: 'SPECIES_TO_HOENN',
    }),
    speciesToNationalPokedexNum: new FunctionArrayHandler<NationalDexMapping>({
      definition:
        'static const u16 sSpeciesToNationalPokedexNum[NUM_SPECIES - 1]',
      functionConfig: {
        functionName: 'SPECIES_TO_NATIONAL',
        parameterProps: [
          getProp('speciesConst', DefaultConstHandler),
          getProp('nationalDexConst', DefaultConstHandler),
        ],
      },
    }),
    hoennToNationalOrder: new FunctionArrayHandler({
      definition: 'static const u16 sHoennToNationalOrder[HOENN_DEX_COUNT - 1]',
      functionConfig: 'HOENN_TO_NATIONAL',
    }),
    frontAnimIds: new ArrayHandler<AnimId>({
      definition: 'const u8 sMonFrontAnimIdsTable[NUM_SPECIES - 1]',
      indexProperty: 'speciesConst',
      indexPrefix: 'SPECIES_',
      indexSuffix: ' - 1',
      propHandler: getProp('anim', new ConstHandler({ prefix: 'ANIM_' })),
    }),
    animationDelays: new ArrayHandler<SpeciesNumber>({
      definition: 'static const u8 sMonAnimationDelayTable[NUM_SPECIES - 1]',
      indexProperty: 'speciesConst',
      indexPrefix: 'SPECIES_',
      indexSuffix: ' - 1',
      propHandler: getProp('num', IntHandler),
    }),
  },
};
