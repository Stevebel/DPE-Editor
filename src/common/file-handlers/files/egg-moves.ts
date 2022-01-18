import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionHandler, getListProp } from '../handlers/function-handler';
import { getProp } from '../handlers/struct-handler';

export type EggMovesStructure = {
  eggMoves: EggMoves[];
};

export type EggMoves = {
  species: string;
  moves: string[];
};

export const EggMovesSourceDef: SourceFileDefinition<EggMovesStructure> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Egg_Moves.c',
    },
  ],
  schema: {
    eggMoves: new ArrayHandler<EggMoves>({
      definition: 'const u16 gEggMoves[]',
      terminator: 'EGG_MOVES_TERMINATOR',
      itemHandler: new FunctionHandler<EggMoves>({
        functionName: 'egg_moves',
        parameterProps: [getProp('species', DefaultConstHandler)],
        restParametersProp: getListProp(
          'moves',
          new ConstHandler({ prefix: 'MOVE_' })
        ),
      }),
    }),
  },
};
