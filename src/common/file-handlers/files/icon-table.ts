import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type IconMapping = {
  species: string;
  icon: string;
};

export type IconTable = {
  icons: IconMapping[];
};

export const IconTableSourceDef: SourceFileDefinition<IconTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Icon_Table.c',
    },
  ],
  schema: {
    icons: new ArrayHandler<IconMapping>({
      definition: 'const u8* const gMonIconTable[NUM_SPECIES]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('icon', new ConstHandler({ suffix: 'Tiles' })),
    }),
  },
};
