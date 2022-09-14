import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type LevelUpLearnsetPointers = {
  pointers: LevelUpLearnsetPointer[];
};

export type LevelUpLearnsetPointer = {
  species: string;
  learnsetConst: string;
};

export const LevelUpLearnsetPointersSourceDef: SourceFileDefinition<LevelUpLearnsetPointers> =
  {
    location: [
      {
        folder: 'src',
        fileName: 'src/data/pokemon/level_up_learnset_pointers.h',
      },
    ],
    schema: {
      pointers: new ArrayHandler<LevelUpLearnsetPointer>({
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        propHandler: getProp(
          'learnsetConst',
          new ConstHandler({ prefix: 's', suffix: 'LevelUpLearnset' })
        ),
      }),
    },
  };
