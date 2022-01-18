import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type IconPalette = {
  species: string;
  palette: number;
};

export type IconPaletteTable = {
  iconPalettes: IconPalette[];
};

export const IconPaletteTableSourceDef: SourceFileDefinition<IconPaletteTable> =
  {
    location: [
      {
        folder: 'dpe',
        fileName: 'src/Icon_Palette_Table.c',
      },
    ],
    schema: {
      iconPalettes: new ArrayHandler<IconPalette>({
        definition: 'const u8 gMonIconPaletteIndices[NUM_SPECIES]',
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        propHandler: getProp('palette', IntHandler),
      }),
    },
  };
