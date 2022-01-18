import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler } from '../handlers/const-handler';
import { FunctionHandler } from '../handlers/function-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type LevelUpMove = {
  level: number;
  move: string;
};
export type LevelUpMoves = {
  species: string;
  levelUpMoves: LevelUpMove[];
};
export type Learnsets = {
  learnsets: LevelUpMoves[];
};

export const LearnsetsSourceDef: SourceFileDefinition<Learnsets> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Learnsets.c',
    },
  ],
  schema: {
    learnsets: new ConstDefinitionHandler<LevelUpMoves>({
      definitionPrefix: 'static const struct LevelUpMove s',
      indexProperty: 'species',
      definitionSuffix: 'LevelUpLearnset[]',
      propHandler: getProp(
        'levelUpMoves',
        new ArrayHandler<LevelUpMove>({
          terminator: 'LEVEL_UP_END',
          itemHandler: new FunctionHandler({
            functionName: 'LEVEL_UP_MOVE',
            parameterProps: [
              getProp('level', IntHandler),
              getProp('move', new ConstHandler({ prefix: 'MOVE_' })),
            ],
          }),
        })
      ),
    }),
  },
};
