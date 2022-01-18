import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { CryTable, CryTableSourceDef, ToneData } from './cry-table';

// eslint-disable-next-line import/prefer-default-export
export const CryTable2SourceDef: SourceFileDefinition<CryTable> = {
  ...CryTableSourceDef,
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Cry_Table_2.c',
    },
  ],
  schema: {
    cryTable: new ArrayHandler<ToneData>({
      ...(
        CryTableSourceDef.schema.cryTable as ArrayHandler<ToneData>
      ).getConfig(),
      definition: 'const struct ToneData gCryTable2[NUM_SPECIES]',
    }),
  },
};
