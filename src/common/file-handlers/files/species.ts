import { SourceFileDefinition } from '../file-handler.interface';
import { CommentSeparatedSectionHandler } from '../handlers/comment-separated-section-handler';
import DefineCountHandler from '../handlers/define-consts-handler';
import { DefinesHandler } from '../handlers/defines-handler';

export interface SpeciesStructure {
  species: SpeciesData[];
  lastEntry: string;
  additionalSpecies: SpeciesData[];
}
export interface SpeciesData {
  species: string;
  number: number;
  index?: number;
}

export const SpeciesSourceDef: SourceFileDefinition<SpeciesStructure> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'include/species.h',
    },
    {
      folder: 'cfru',
      fileName: 'include/constants/species.h',
    },
  ],
  schema: {
    species: new CommentSeparatedSectionHandler({
      endComment: 'Extra species',
      handler: new DefinesHandler<SpeciesData>({
        constPrefix: 'SPECIES_',
        constProperty: 'species',
        numberProperty: 'number',
      }),
    }),
    lastEntry: new DefineCountHandler({
      constName: 'LAST_CUSTOM_SPECIES',
      countPrefix: 'SPECIES_',
      addOne: false,
    }),
    additionalSpecies: new CommentSeparatedSectionHandler({
      startComment: 'Extra species',
      outputComment: true,
      handler: new DefinesHandler<SpeciesData>({
        constPrefix: 'SPECIES_',
        constProperty: 'species',
        numberProperty: 'number',
        numberPrefix: 'LAST_CUSTOM_SPECIES + ',
      }),
    }),
  },
};
