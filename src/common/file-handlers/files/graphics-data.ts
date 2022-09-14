import { SourceFileDefinition } from '../file-handler.interface';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export type GraphicsData = {
  frontPics: GraphicsEntry[];
  backPics: GraphicsEntry[];
  palettes: GraphicsEntry[];
  shinyPalettes: GraphicsEntry[];
  icons: GraphicsEntry[];
  footprints: GraphicsEntry[];
};

export type GraphicsEntry = {
  species: string;
  file: string;
};

export const GraphicsDataSourceDef: SourceFileDefinition<GraphicsData> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/graphics/pokemon.h',
    },
  ],
  schema: {
    frontPics: new ConstDefinitionHandler({
      definitionPrefix: 'const u32 gMonFrontPic_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U32("graphics/pokemon/',
          suffix: '.4bpp.lz");',
        })
      ),
    }),
    backPics: new ConstDefinitionHandler({
      definitionPrefix: 'const u32 gMonBackPic_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U32("graphics/pokemon/',
          suffix: '.4bpp.lz");',
        })
      ),
    }),
    palettes: new ConstDefinitionHandler({
      definitionPrefix: 'const u32 gMonPalette_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U32("graphics/pokemon/',
          suffix: '.gbapal.lz");',
        })
      ),
    }),
    shinyPalettes: new ConstDefinitionHandler({
      definitionPrefix: 'const u32 gMonShinyPalette_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U32("graphics/pokemon/',
          suffix: '.gbapal.lz");',
        })
      ),
    }),
    icons: new ConstDefinitionHandler({
      definitionPrefix: 'const u8 gMonIcon_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U8("graphics/pokemon/',
          suffix: '.4bpp");',
        })
      ),
    }),
    footprints: new ConstDefinitionHandler({
      definitionPrefix: 'const u8 gMonFootprint_',
      definitionSuffix: '[]',
      indexProperty: 'species',
      propHandler: getProp(
        'file',
        new ConstHandler({
          prefix: 'INCBIN_U8("graphics/pokemon/',
          suffix: '.1bpp");',
        })
      ),
    }),
  },
};
