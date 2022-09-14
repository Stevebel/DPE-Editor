import { SourceFileDefinition } from '../file-handler.interface';

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
    // TODO
  },
};
