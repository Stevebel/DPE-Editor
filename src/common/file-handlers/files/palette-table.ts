import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type CompressedSpritePalette = {
  species: string;
  sprite: string;
  unused: number;
};

export type PaletteTable = {
  palettes: CompressedSpritePalette[];
};

function getPaletteTableSourceDef(
  fileName: string,
  definition: string
): SourceFileDefinition<PaletteTable> {
  return {
    location: [
      {
        folder: 'dpe',
        fileName,
      },
    ],
    schema: {
      palettes: new ArrayHandler<CompressedSpritePalette>({
        definition,
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        itemHandler: new StructHandler({
          namedProps: false,
          props: [
            getProp('sprite', new ConstHandler({ suffix: 'Pal' })),
            getProp('species', new ConstHandler({ prefix: 'SPECIES_' })),
            getProp('unused', IntHandler),
          ],
        }),
      }),
    },
  };
}

export const PaletteTableSourceDef = getPaletteTableSourceDef(
  'src/Palette_Table.c',
  'const struct CompressedSpritePalette gMonPaletteTable[NUM_SPECIES]'
);

export const ShinyPaletteTableSourceDef = getPaletteTableSourceDef(
  'src/Shiny_Palette_Table.c',
  'const struct CompressedSpritePalette gMonShinyPaletteTable[NUM_SPECIES]'
);
