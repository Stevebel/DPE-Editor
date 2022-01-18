import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler, IntOrConstHandler } from '../handlers/const-handler';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type Evolution = {
  method: string;
  param: string | number;
  targetSpecies: string;
  extra: string | number;
};

export type Evolutions = {
  species: string;
  evolutions: Evolution[];
};

export type EvolutionTable = {
  evolutions: Evolutions[];
};

export const EvolutionTableSourceDef: SourceFileDefinition<EvolutionTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Evolution Table.c',
    },
  ],
  schema: {
    evolutions: new ArrayHandler<Evolutions>({
      definition:
        'const struct Evolution gEvolutionTable[NUM_SPECIES][EVOS_PER_MON]',
      indexProperty: 'species',
      indexPrefix: 'SPECIES_',
      propHandler: getProp(
        'evolutions',
        new ArrayHandler<Evolution>({
          itemHandler: new StructHandler({
            namedProps: false,
            props: [
              getProp('method', new ConstHandler({ prefix: 'EVO_' })),
              getProp('param', IntOrConstHandler),
              getProp(
                'targetSpecies',
                new ConstHandler({ prefix: 'SPECIES_' })
              ),
              getProp('extra', IntOrConstHandler),
            ],
          }),
        })
      ),
    }),
  },
};
