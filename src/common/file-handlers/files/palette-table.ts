import { SourceFileDefinition } from '../file-handler.interface';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { getProp } from '../handlers/struct-handler';
import { SpeciesMapping } from './pic-table';

export type PaletteTable = {
  palettes: SpeciesMapping[];
  femalePalettes: SpeciesMapping[];
};

function getPaletteTableSourceDef(
  fileName: string,
  definition: string,
  femaleDefinition: string,
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
      palettes: new FunctionArrayHandler<SpeciesMapping>({
        definition: `const struct CompressedSpritePalette ${definition}[]`,
        functionConfig: {
          functionName,
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('name', new ConstHandler({ prefix })),
          ],
        },
      }),
      femalePalettes: new FunctionArrayHandler<SpeciesMapping>({
        definition: `const struct CompressedSpritePalette ${femaleDefinition}[]`,
        functionConfig: {
          functionName,
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('name', new ConstHandler({ prefix })),
          ],
        },
      }),
    },
  };
}

export const PaletteTableSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/palette_table.h',
  'gMonPaletteTable',
  'gMonPaletteTableFemale',
  'SPECIES_PAL',
  'gMonPalette_'
);

export const ShinyPaletteTableSourceDef = getPaletteTableSourceDef(
  'src/data/pokemon_graphics/shiny_palette_table.h',
  'gMonShinyPaletteTable',
  'gMonShinyPaletteTableFemale',
  'SPECIES_SHINY_PAL',
  'gMonShinyPalette_'
);
