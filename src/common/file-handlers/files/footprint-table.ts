import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type Footprint = {
  species: string;
  footprint: number;
};

export type FootprintTable = {
  footprints: Footprint[];
};

export const FootprintTableSourceDef: SourceFileDefinition<FootprintTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Footprint_Table.c',
    },
  ],
  schema: {
    footprints: new ArrayHandler<Footprint>({
      definition: 'const u32 gMonFootprintTable[NUM_SPECIES]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('footprint', IntHandler),
    }),
  },
};
