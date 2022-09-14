import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type Footprint = {
  species: string;
  footprint: string;
};

export type FootprintTable = {
  footprints: Footprint[];
};

export const FootprintTableSourceDef: SourceFileDefinition<FootprintTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon_graphics/footprint_table.h',
    },
  ],
  schema: {
    footprints: new ArrayHandler<Footprint>({
      definition: 'const u8 *const gMonFootprintTable[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp(
        'footprint',
        new ConstHandler({ prefix: 'gMonFootprint_' })
      ),
    }),
  },
};
