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
  id?: string;
};
export type LevelUpMoves = {
  learnset: string;
  levelUpMoves: LevelUpMove[];
};
export type Learnset = {
  species: string;
  learnset: string;
};

export type Learnsets = {
  learnsets: LevelUpMoves[];
  learnsetConsts: Learnset[];
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
      indexProperty: 'learnset',
      definitionSuffix: '[]',
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
    learnsetConsts: new ArrayHandler<Learnset>({
      definition:
        'const struct LevelUpMove* const gLevelUpLearnsets[NUM_SPECIES]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('learnset', new ConstHandler({ prefix: 's' })),
    }),
  },
};
