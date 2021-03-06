import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type EnemyMonElevation = {
  species: string;
  elevation: number;
};

export type EnemyElevationTable = {
  elevations: EnemyMonElevation[];
};

export const EnemyElevationTableSourceDef: SourceFileDefinition<EnemyElevationTable> =
  {
    location: [
      {
        folder: 'dpe',
        fileName: 'src/Enemy_Elevation_Table.c',
      },
    ],
    schema: {
      elevations: new ArrayHandler<EnemyMonElevation>({
        definition: 'const u8 gEnemyMonElevation[NUM_SPECIES]',
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        propHandler: getProp('elevation', IntHandler),
      }),
    },
  };
