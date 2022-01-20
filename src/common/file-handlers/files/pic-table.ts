import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type PicTable = {
  pics: CompressedSpriteSheet[];
};

export type CompressedSpriteSheet = {
  species: string;
  sprite: string;
  size: number;
};

function getPicTableSourceDef(
  fileName: string,
  definition: string
): SourceFileDefinition<PicTable> {
  return {
    location: [
      {
        folder: 'dpe',
        fileName,
      },
    ],
    schema: {
      pics: new ArrayHandler<CompressedSpriteSheet>({
        definition,
        indexPrefix: 'SPECIES_',
        indexProperty: 'species',
        itemHandler: new StructHandler({
          namedProps: false,
          props: [
            getProp('sprite', new ConstHandler({ suffix: 'Tiles' })),
            getProp('size', IntHandler),
            getProp('species', new ConstHandler({ prefix: 'SPECIES_' })),
          ],
        }),
      }),
    },
  };
}

export const BackPicTableSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/Back_Pic_Table.c',
    'const struct CompressedSpriteSheet gMonBackPicTable[NUM_SPECIES]'
  );

export const FrontPicTableSourceDef: SourceFileDefinition<PicTable> =
  getPicTableSourceDef(
    'src/Front_Pic_Table.c',
    'const struct CompressedSpriteSheet gMonFrontPicTable[NUM_SPECIES]'
  );
