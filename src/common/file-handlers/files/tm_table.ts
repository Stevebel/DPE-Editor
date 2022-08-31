import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';

export interface TMTable {
  tmMoves: string[];
}

export const TMTableSourceDef: SourceFileDefinition<TMTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/TM_Tutor_Tables.c',
    },
  ],
  schema: {
    tmMoves: new ArrayHandler<string>({
      definition: `const u16 gTMHMMoves[NUM_TMSHMS]`,
      itemHandler: new ConstHandler({ prefix: 'MOVE_' }),
    }),
  },
};
