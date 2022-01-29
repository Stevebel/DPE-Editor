import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

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
      mappings: new ArrayHandler<SpeciesPokedexMapping>({
        definition: 'const u16 gSpeciesToNationalPokedexNum[NUM_SPECIES - 1]',
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        indexSuffix: ' - 1',
        propHandler: getProp(
          'nationalDex',
          new ConstHandler({ prefix: 'NATIONAL_DEX_' })
        ),
      }),
    },
  };
