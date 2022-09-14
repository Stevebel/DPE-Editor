import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type TeachableLearnsets = {
  learnsets: TeachableLearnset[];
};

export type TeachableLearnset = {
  learnsetConst: string;
  moves: string[];
};

export const TeachableLearnsetsSourceDef: SourceFileDefinition<TeachableLearnsets> =
  {
    location: [
      {
        folder: 'src',
        fileName: 'src/data/pokemon/teachable_learnsets.h',
      },
    ],
    schema: {
      learnsets: new ConstDefinitionHandler<TeachableLearnset>({
        indexProperty: 'learnsetConst',
        definitionPrefix: 'static const struct LevelUpMove s',
        definitionSuffix: 'LevelUpLearnset[]',
        propHandler: getProp(
          'moves',
          new ArrayHandler<string>({
            itemHandler: new ConstHandler({ prefix: 'MOVE_' }),
            terminator: 'MOVE_UNAVAILABLE',
          })
        ),
      }),
    },
  };
