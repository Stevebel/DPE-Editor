import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';
import { SpeciesMapping } from './pic-table';

export type IconTable = {
  icons: SpeciesMapping[];
  iconsFemale: SpeciesMapping[];
  palettes: IconPalette[];
  palettesFemale: IconPalette[];
};

export type IconPalette = {
  species: string;
  palette: number;
};

export const IconTableSourceDef: SourceFileDefinition<IconTable> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/pokemon_icon.c',
    },
  ],
  schema: {
    icons: new ArrayHandler<SpeciesMapping>({
      definition: 'const u8 *const gMonIconTable[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('name', new ConstHandler({ prefix: 'gMonIcon_' })),
    }),
    iconsFemale: new ArrayHandler<SpeciesMapping>({
      definition: 'const u8 *const gMonIconTableFemale[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('name', new ConstHandler({ prefix: 'gMonIcon_' })),
    }),
    palettes: new ArrayHandler<IconPalette>({
      definition: 'const u8 gMonIconPaletteIndices[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('palette', IntHandler),
    }),
    palettesFemale: new ArrayHandler<IconPalette>({
      definition: 'const u8 gMonIconPaletteIndicesFemale[]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp('palette', IntHandler),
    }),
  },
};
