import { SourceFileDefinition } from '../file-handler.interface';
import DefineCountHandler from '../handlers/define-consts-handler';
import { EnumHandler } from '../handlers/enum-handler';

export type PokedexConsts = {
  nationalDexConsts: string[];
  regionalDexConsts: string[];
  nationalDexLastEntry: string;
  hoennDexLastEntry: string;
};

export const PokedexConstsSourceDef: SourceFileDefinition<PokedexConsts> = {
  location: [
    {
      folder: 'src',
      fileName: 'include/constants/pokedex.h',
    },
  ],
  schema: {
    nationalDexConsts: new EnumHandler({
      itemPrefix: 'NATIONAL_DEX_',
    }),
    regionalDexConsts: new EnumHandler({
      itemPrefix: 'HOENN_DEX_',
    }),
    nationalDexLastEntry: new DefineCountHandler({
      constName: 'NATIONAL_DEX_COUNT',
      countPrefix: 'NATIONAL_DEX_',
      addOne: false,
    }),
    hoennDexLastEntry: new DefineCountHandler({
      constName: 'HOENN_DEX_COUNT',
      countPrefix: 'HOENN_DEX_',
      addOne: true,
    }),
  },
};
