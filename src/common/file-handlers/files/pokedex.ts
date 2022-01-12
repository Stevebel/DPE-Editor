import { SourceFileDefinition } from '../file-handler.interface';
import DefineCountHandler from '../handlers/define-consts-handler';
import { DefinesHandler } from '../handlers/defines-handler';
import { ExternConstHandler } from '../handlers/extern-const-handler';

export type PokedexConsts = {
  nationalDexConsts: NationalDexConst[];
  finalDexEntry: string;
  dexEntryConsts: string[];
};
export type NationalDexConst = {
  nationalDex: string;
  number: number;
};

export const PokedexConstsSourceDef: SourceFileDefinition<PokedexConsts> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'include/pokedex.h',
    },
  ],
  schema: {
    nationalDexConsts: new DefinesHandler<NationalDexConst>({
      constPrefix: 'NATIONAL_DEX_',
      constProperty: 'nationalDex',
      numberProperty: 'number',
    }),
    finalDexEntry: new DefineCountHandler({
      constName: 'FINAL_DEX_ENTRY',
      addOne: false,
    }),
    dexEntryConsts: new ExternConstHandler({
      constPrefix: 'DEX_ENTRY_',
    }),
  },
};
