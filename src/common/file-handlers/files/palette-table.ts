import { SourceFileDefinition } from '../file-handler.interface';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { getProp } from '../handlers/struct-handler';

export type CompressedSpritePalette = {
  species: string;
  sprite: string;
};

export type PaletteTable = {
  palettes: CompressedSpritePalette[];
};

function getPaletteTableSourceDef(
  fileName: string,
  definition: string,
  functionName: string,
  prefix: string
): SourceFileDefinition<PaletteTable> {
  return {
    location: [
      {
        folder: 'src',
        fileName,
      },
    ],
    schema: {
      palettes: new FunctionArrayHandler<CompressedSpritePalette>({
        definition: `const struct CompressedSpritePalette ${definition}[]`,
        functionConfig: {
          functionName,
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('sprite', new ConstHandler({ prefix })),
          ],
        },
      }),
    },
  };
}

export const PaletteTableSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/palette_table.h',
  'gMonPaletteTable',
  'SPECIES_PAL',
  'gMonPalette_'
);

export const PaletteTableFemaleSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/palette_table.h',
  'gMonPaletteTableFemale',
  'SPECIES_PAL',
  'gMonPalette_'
);

export const ShinyPaletteTableSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/shiny_palette_table.h',
  'gMonShinyPaletteTable',
  'SPECIES_SHINY_PAL',
  'gMonShinyPalette_'
);

export const ShinyPaletteTableFemaleSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/shiny_palette_table.h',
  'gMonShinyPaletteTableFemale',
  'SPECIES_SHINY_PAL',
  'gMonShinyPalette_'
);
