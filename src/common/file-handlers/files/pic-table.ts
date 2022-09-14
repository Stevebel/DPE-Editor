import { SourceFileDefinition } from '../file-handler.interface';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { getProp } from '../handlers/struct-handler';

export type PicTable = {
  pics: CompressedSpriteSheet[];
};

export type CompressedSpriteSheet = {
  species: string;
  spriteConst: string;
};

function getPicTableSourceDef(
  fileName: string,
  arrayName: string,
  prefix: string
): SourceFileDefinition<PicTable> {
  return {
    location: [
      {
        folder: 'src',
        fileName,
      },
    ],
    schema: {
      pics: new FunctionArrayHandler<CompressedSpriteSheet>({
        definition: `const struct CompressedSpriteSheet ${arrayName}[]`,
        functionConfig: {
          functionName: 'SPECIES_SPRITE',
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('spriteConst', new ConstHandler({ prefix })),
          ],
        },
      }),
    },
  };
}

export const BackPicTableSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/data/pokemon_graphics/back_pic_table.h',
    'gMonBackPicTable',
    'gMonBackPic_'
  );

export const BackPicTableFemaleSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/data/pokemon_graphics/back_pic_table.h',
    'gMonBackPicTableFemale',
    'gMonBackPicFemale_'
  );

export const FrontPicTableSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/data/pokemon_graphics/front_pic_table.h',
    'gMonFrontPicTable',
    'gMonFrontPic_'
  );

export const FrontPicTableFemaleSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/data/pokemon_graphics/front_pic_table.h',
    'gMonFrontPicTableFemale',
    'gMonFrontPicFemale_'
  );
