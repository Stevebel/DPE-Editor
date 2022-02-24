import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type HabitatPage = {
  name: string;
  species: string[];
  count?: string;
};

export type HabitatPages = {
  name: string;
  pages: HabitatPage[];
};

export type HabitatTable = {
  pages: HabitatPage[];
  habitats: HabitatPages[];
};

export const HabitatTableSourceDef: SourceFileDefinition<HabitatTable> = {
  location: [
    {
      folder: 'dpe',
      fileName: 'src/Habitat_Table.c',
    },
  ],
  schema: {
    pages: new ConstDefinitionHandler<HabitatPage>({
      definitionPrefix: 'const u16 g',
      indexProperty: 'name',
      definitionSuffix: '[]',
      propHandler: getProp(
        'species',
        new ArrayHandler<string>({
          itemHandler: new ConstHandler({ prefix: 'SPECIES_' }),
        })
      ),
    }),
    habitats: new ConstDefinitionHandler<HabitatPages>({
      definitionPrefix: 'const struct HabitatPage g',
      indexProperty: 'name',
      definitionSuffix: 'Pages[]',
      propHandler: getProp(
        'pages',
        new ArrayHandler<HabitatPage>({
          itemHandler: new StructHandler({
            namedProps: false,
            props: [
              getProp('name', new ConstHandler({ prefix: 'g' })),
              getProp(
                'name',
                new ConstHandler({ prefix: 'ARRAY_COUNT(g', suffix: ')' })
              ),
            ],
          }),
        })
      ),
    }),
  },
};
