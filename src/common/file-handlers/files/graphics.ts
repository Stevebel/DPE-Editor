import { SourceFileDefinition } from '../file-handler.interface';
import { ExternConstHandler } from '../handlers/extern-const-handler';

export type GraphicsIncludes = {
  frontPics: string[];
  backPics: string[];
  palettes: string[];
  shinyPalettes: string[];
  icons: string[];
  footprints: string[];
};

export const GraphicsSourceDef: SourceFileDefinition<GraphicsIncludes> = {
  location: [
    {
      folder: 'src',
      fileName: 'include/graphics.h',
    },
  ],
  schema: {
    frontPics: new ExternConstHandler({
      constPrefix: 'u32 gMonFrontPic_',
      constSuffix: '[]',
    }),
    backPics: new ExternConstHandler({
      constPrefix: 'u32 gMonBackPic_',
      constSuffix: '[]',
    }),
    palettes: new ExternConstHandler({
      constPrefix: 'u32 gMonPalette_',
      constSuffix: '[]',
    }),
    shinyPalettes: new ExternConstHandler({
      constPrefix: 'u32 gMonShinyPalette_',
      constSuffix: '[]',
    }),
    icons: new ExternConstHandler({
      constPrefix: 'u8 gMonIcon_',
      constSuffix: '[]',
    }),
    footprints: new ExternConstHandler({
      constPrefix: 'u8 gMonFootprint_',
      constSuffix: '[]',
    }),
  },
};
