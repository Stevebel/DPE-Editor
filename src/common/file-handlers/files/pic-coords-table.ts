import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { FunctionHandler } from '../handlers/function-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type PicCoordsTable = {
  picCoords: PicCoords[];
};
export type PicCoords = {
  species: string;
  size: CoordsSize;
  y_offset: number;
};
export type CoordsSize = {
  width: number;
  height: number;
};

function getPicCoordsTableSourceDef(
  fileName: string,
  definition: string
): SourceFileDefinition<PicCoordsTable> {
  return {
    location: [
      {
        folder: 'src',
        fileName,
      },
    ],
    schema: {
      picCoords: new ArrayHandler<PicCoords>({
        definition,
        indexPrefix: 'SPECIES_',
        indexProperty: 'species',
        itemHandler: new StructHandler({
          props: [
            getProp(
              'size',
              new FunctionHandler<CoordsSize>({
                functionName: 'MON_COORDS_SIZE',
                parameterProps: [
                  getProp('width', IntHandler),
                  getProp('height', IntHandler),
                ],
              })
            ),
            getProp('y_offset', IntHandler),
          ],
        }),
      }),
    },
  };
}

export const BackPicCoordsTableSourceDef = getPicCoordsTableSourceDef(
  'src/data/pokemon_graphics/back_pic_coordinates.h',
  'const struct MonCoords gMonBackPicCoords[]'
);

export const FrontPicCoordsTableSourceDef = getPicCoordsTableSourceDef(
  'src/data/pokemon_graphics/front_pic_coordinates.h',
  'const struct MonCoords gMonFrontPicCoords[]'
);
