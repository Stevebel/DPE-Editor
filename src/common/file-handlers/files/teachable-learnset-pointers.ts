import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type TeachableLearnsetPointers = {
  pointers: TeachableLearnsetPointer[];
};

export type TeachableLearnsetPointer = {
  species: string;
  learnsetConst: string;
};

export const TeachableLearnsetPointersSourceDef: SourceFileDefinition<TeachableLearnsetPointers> =
  {
    location: [
      {
        folder: 'src',
        fileName: 'src/data/pokemon/teachable_learnset_pointers.h',
      },
    ],
    schema: {
      pointers: new ArrayHandler<TeachableLearnsetPointer>({
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        propHandler: getProp(
          'learnsetConst',
          new ConstHandler({ prefix: 's', suffix: 'TeachableLearnset' })
        ),
      }),
    },
  };
