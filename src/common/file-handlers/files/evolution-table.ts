import { z } from 'zod';
import { EvolutionSchema } from '../../lookup-values';
import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler, IntOrConstHandler } from '../handlers/const-handler';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type Evolution = z.infer<typeof EvolutionSchema>;

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
      folder: 'src',
      fileName: 'src/data/pokemon/evolution.h',
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
            ],
          }),
          formatInline: true,
        })
      ),
    }),
  },
};
