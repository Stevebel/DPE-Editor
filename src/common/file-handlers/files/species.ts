import { SourceFileDefinition } from '../file-handler.interface';
import { DefineCountHandler, DefinesHandler } from '../handlers/defines-handler';

export interface SpeciesStructure {
  species: SpeciesData[];
  lastEntry: string;
}
export interface SpeciesData {
  species: string;
  number: number;
}

export const SpeciesSourceDef: SourceFileDefinition<SpeciesStructure> = {
  location: [
    {
      folder: 'cfru',
      fileName: 'include/constants/species.h',
    },
    {
      folder: 'dpe',
      fileName: 'include/species.h',
    },
  ],
  schema: {
    species: new DefinesHandler<SpeciesData>({
      constPrefix: 'SPECIES_',
      constProperty: 'species',
      numberProperty: 'number',
    }),
    lastEntry: new DefineCountHandler({
      constName: 'NUM_SPECIES',
    }),
  },
};
