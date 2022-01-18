import { SourceFileDefinition } from '../file-handler.interface';
import { SingleEquDefineHandler } from '../handlers/single-equ-define';

export interface SpecialInserts {
  finalDexEntry: number;
}

export const SpecialInsertsSourceDef: SourceFileDefinition<SpecialInserts> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'special_inserts.asm',
    },
  ],
  schema: {
    finalDexEntry: new SingleEquDefineHandler({
      constName: 'FINAL_DEX_ENTRY',
    }),
  },
};
