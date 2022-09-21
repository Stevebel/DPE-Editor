import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';
import { SpeciesMapping } from './pic-table';

export type FootprintTable = {
  footprints: SpeciesMapping[];
};

export const FootprintTableSourceDef: SourceFileDefinition<FootprintTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon_graphics/footprint_table.h',
    },
  ],
  schema: {
    footprints: new ArrayHandler<SpeciesMapping>({
      definition: 'const u8 *const gMonFootprintTable[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp(
        'name',
        new ConstHandler({ prefix: 'gMonFootprint_' })
      ),
    }),
  },
};
