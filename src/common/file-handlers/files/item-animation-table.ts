import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp, StructHandler } from '../handlers/struct-handler';

export type ItemAnimation = {
  species: string;
  anim1: number;
  anim2: number;
  anim3: number;
  anim4: number;
  anim5: number;
};

export type ItemAnimationTable = {
  itemAnimations: ItemAnimation[];
};

export const ItemAnimationTableSourceDef: SourceFileDefinition<ItemAnimationTable> =
  {
    location: [
      {
        folder: 'dpe',
        fileName: 'src/Item_Animation_Table.c',
      },
    ],
    schema: {
      itemAnimations: new ArrayHandler<ItemAnimation>({
        definition:
          'const struct ItemAnimation gItemAnimationTable[NUM_SPECIES]',
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        itemHandler: new StructHandler({
          namedProps: false,
          props: [
            getProp('anim1', IntHandler),
            getProp('anim2', IntHandler),
            getProp('anim3', IntHandler),
            getProp('anim4', IntHandler),
            getProp('anim5', IntHandler),
          ],
        }),
      }),
    },
  };
