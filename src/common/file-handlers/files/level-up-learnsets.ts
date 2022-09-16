import { SourceFileDefinition } from '../file-handler.interface';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type LevelUpLearnsets = {
  learnsets: LevelUpLearnset[];
};

export type LevelUpLearnset = {
  learnsetConst: string;
  levelUpMoves: LevelUpMove[];
};

export type LevelUpMove = {
  level: number;
  move: string;
  id?: string;
};

export const LevelUpLearnsetsSourceDef: SourceFileDefinition<LevelUpLearnsets> =
  {
    location: [
      {
        folder: 'src',
        fileName: 'src/data/pokemon/level_up_learnsets.h',
      },
    ],
    schema: {
      learnsets: new ConstDefinitionHandler<LevelUpLearnset>({
        indexProperty: 'learnsetConst',
        definitionPrefix: 'static const struct LevelUpMove s',
        definitionSuffix: 'LevelUpLearnset[]',
        propHandler: getProp(
          'levelUpMoves',
          new FunctionArrayHandler<LevelUpMove>({
            functionConfig: {
              functionName: 'LEVEL_UP_MOVE',
              parameterProps: [
                getProp('level', IntHandler),
                getProp('move', new ConstHandler({ prefix: 'MOVE_' })),
              ],
            },
            terminator: 'LEVEL_UP_END',
          })
        ),
      }),
    },
  };
