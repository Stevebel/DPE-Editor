import { SourceFileDefinition } from '../file-handler.interface';
import { IncListHandler } from '../handlers/inc-list-handler';

export type CryTable = {
  cries: string[];
  criesReverse: string[];
};

export const CryTableSourceDef: SourceFileDefinition<CryTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'sound/cry_tables.inc',
    },
  ],
  schema: {
    cries: new IncListHandler({
      label: 'gCryTable',
      itemPrefix: 'cry Cry_',
    }),
    criesReverse: new IncListHandler({
      label: 'gCryTable_Reverse',
      itemPrefix: 'cry_reverse Cry_',
    }),
  },
};
