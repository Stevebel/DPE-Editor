import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type PicCoordsTable = {
  picCoords: PicCoords[];
};
export type PicCoords = {
  species: string;
  size: number;
  y_offset: number;
};

function getPicCoordsTableSourceDef(
  fileName: string,
  definition: string
): SourceFileDefinition<PicCoordsTable> {
  return {
    location: [
      {
        folder: 'dpe',
        fileName,
      },
    ],
    schema: {
      picCoords: new ArrayHandler<PicCoords>({
        definition,
        indexPrefix: 'SPECIES_',
        indexProperty: 'species',
        itemHandler: new StructHandler({
          props: [getProp('size', IntHandler), getProp('y_offset', IntHandler)],
        }),
      }),
    },
  };
}

export const BackPicCoordsTableSourceDef = getPicCoordsTableSourceDef(
  'src/Back_Pic_Coords_Table.c',
  'const struct MonCoords gMonBackPicCoords[NUM_SPECIES]'
);

export const FrontPicCoordsTableSourceDef = getPicCoordsTableSourceDef(
  'src/Front_Pic_Coords_Table.c',
  'const struct MonCoords gMonFrontPicCoords[NUM_SPECIES]'
);
