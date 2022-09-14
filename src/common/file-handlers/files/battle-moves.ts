import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { FlagHandler as FlagsHandler } from '../handlers/flags-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type BattleMove = {
  move: string;
  effect: string;
  power: number;
  type: string;
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: string;
  priority: number;
  flags: string[];
  split: string;
  argument: string;
  zMovePower: number;
  zMoveEffect: string;
};

export type BattleMoves = {
  moves: BattleMove[];
};

export const BattleMovesSourceDef: SourceFileDefinition<BattleMoves> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/battle_moves.h',
    },
  ],
  schema: {
    moves: new ArrayHandler<BattleMove>({
      definition: 'const struct BattleMove gBattleMoves[]',
      indexPrefix: 'MOVE_',
      indexProperty: 'move',
      itemHandler: new StructHandler({
        props: [
          getProp('effect', new ConstHandler({ prefix: 'EFFECT_' })),
          getProp('power', IntHandler),
          getProp('type', new ConstHandler({ prefix: 'TYPE_' })),
          getProp('accuracy', IntHandler),
          getProp('pp', IntHandler),
          getProp('secondaryEffectChance', IntHandler),
          getProp('target', new ConstHandler({ prefix: 'MOVE_TARGET_' })),
          getProp('priority', IntHandler),
          getProp('flags', new FlagsHandler({ itemPrefix: 'FLAG_' })),
          getProp('split', new ConstHandler({ prefix: 'SPLIT_' })),
          getProp('zMovePower', IntHandler),
          getProp('zMoveEffect', new ConstHandler({ prefix: 'Z_EFFECT_' })),
        ],
      }),
    }),
  },
};
