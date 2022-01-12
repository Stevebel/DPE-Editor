import { SourceFileDefinition } from '../file-handler.interface';
import { ConstMappingArrayHandler } from '../handlers/const-mapping-array-handler';

export type SpeciesPokedexMapping = {
  species: string;
  nationalDex: string;
};

export type SpeciesToPokedex = {
  mappings: SpeciesPokedexMapping[];
};

export const SpeciesToPokedexSourceDef: SourceFileDefinition<SpeciesToPokedex> =
  {
    location: [
      {
        folder: 'dpe',
        // Yes the official file name has a typo
        fileName: 'src/Species_To_Pokdex_Table.c',
      },
    ],
    schema: {
      mappings: new ConstMappingArrayHandler({
        definition: 'const u16 gSpeciesToNationalPokedexNum[NUM_SPECIES - 1]',
        leftHandProperty: 'species',
        rightHandProperty: 'nationalDex',
        leftHandPrefix: 'SPECIES_',
        rightHandPrefix: 'NATIONAL_DEX_',
        leftAdd: -1,
        rightAdd: 0,
      }),
    },
  };
