import { SourceFileDefinition } from '../file-handler.interface';
import { ExternConstHandler } from '../handlers/extern-const-handler';

export interface SpriteData {
  frontSprites: string[];
  backShinySprites: string[];
  frontSpritePals: string[];
  backShinySpritePals: string[];
  iconSprites: string[];
}

export const SpriteDataSourceDef: SourceFileDefinition<SpriteData> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'include/sprite_data.h',
    },
  ],
  schema: {
    frontSprites: new ExternConstHandler({
      constPrefix: '',
      constSuffix: 'Tiles',
    }),
    backShinySprites: new ExternConstHandler({
      constPrefix: '',
      constSuffix: 'Tiles',
    }),
    frontSpritePals: new ExternConstHandler({
      constPrefix: '',
      constSuffix: 'Pal',
    }),
    backShinySpritePals: new ExternConstHandler({
      constPrefix: '',
      constSuffix: 'Pal',
    }),
    iconSprites: new ExternConstHandler({
      constPrefix: '',
      constSuffix: 'Tiles',
    }),
  },
};
