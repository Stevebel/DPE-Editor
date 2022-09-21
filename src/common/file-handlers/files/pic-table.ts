import { SourceFileDefinition } from '../file-handler.interface';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { getProp } from '../handlers/struct-handler';

export type PicTable = {
  pics: SpeciesMapping[];
  femalePics: SpeciesMapping[];
};

export type SpeciesMapping = {
  species: string;
  name: string;
};

function getPicTableSourceDef(
  fileName: string,
  arrayName: string,
  femaleArrayName: string,
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
      pics: new FunctionArrayHandler<SpeciesMapping>({
        definition: `const struct CompressedSpriteSheet ${arrayName}[]`,
        functionConfig: {
          functionName: 'SPECIES_SPRITE',
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('name', new ConstHandler({ prefix })),
          ],
        },
      }),
      femalePics: new FunctionArrayHandler<SpeciesMapping>({
        definition: `const struct CompressedSpriteSheet ${femaleArrayName}[]`,
        functionConfig: {
          functionName: 'SPECIES_SPRITE',
          parameterProps: [
            getProp('species', DefaultConstHandler),
            getProp('name', new ConstHandler({ prefix })),
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
    'gMonBackPicTableFemale',
    'gMonBackPic_'
  );

export const FrontPicTableSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/data/pokemon_graphics/front_pic_table.h',
    'gMonFrontPicTable',
    'gMonFrontPicTableFemale',
    'gMonFrontPic_'
  );
