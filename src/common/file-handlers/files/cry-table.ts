import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { AddressOrConstHandler } from '../handlers/const-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type ToneData = {
  species: string;
  type: number;
  key: number;
  length: number;
  pan_sweep: number;
  wav: string | number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type CryTable = {
  cryTable: ToneData[];
};

export const CryTableSourceDef: SourceFileDefinition<CryTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Cry_Table.c',
    },
  ],
  schema: {
    cryTable: new ArrayHandler<ToneData>({
      definition: 'const struct ToneData gCryTable[NUM_SPECIES]',
      indexPrefix: 'SPECIES_',
      indexProperty: 'species',
      itemHandler: new StructHandler({
        props: [
          getProp('type', IntHandler),
          getProp('key', IntHandler),
          getProp('length', IntHandler),
          getProp('pan_sweep', IntHandler),
          getProp('wav', AddressOrConstHandler),
          getProp('attack', IntHandler),
          getProp('decay', IntHandler),
          getProp('sustain', IntHandler),
          getProp('release', IntHandler),
        ],
      }),
    }),
  },
};
