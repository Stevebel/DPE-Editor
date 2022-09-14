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
      folder: 'src',
      fileName: 'include/sprite_data.h',
    },
  ],
  schema: {
    frontSprites: new ExternConstHandler({
      constPrefix: 'gFrontSprite',
      constSuffix: 'Tiles',
    }),
    backShinySprites: new ExternConstHandler({
      constPrefix: 'gBackShinySprite',
      constSuffix: 'Tiles',
    }),
    frontSpritePals: new ExternConstHandler({
      constPrefix: 'gFrontSprite',
      constSuffix: 'Pal',
    }),
    backShinySpritePals: new ExternConstHandler({
      constPrefix: 'gBackShinySprite',
      constSuffix: 'Pal',
    }),
    iconSprites: new ExternConstHandler({
      constPrefix: 'gIconSprite',
      constSuffix: 'Tiles',
    }),
  },
};
