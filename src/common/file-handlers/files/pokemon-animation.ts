import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstHandler } from '../handlers/const-handler';
import { getProp } from '../handlers/struct-handler';

export interface PokemonAnimation {
  backAnims: SpeciesAnim[];
}

export interface SpeciesAnim {
  species: string;
  anim: string;
}

export const PokemonAnimationSourceDef: SourceFileDefinition<PokemonAnimation> =
  {
    location: [
      {
        folder: 'src',
        fileName: 'src/pokemon_animation.c',
      },
    ],
    schema: {
      backAnims: new ArrayHandler<SpeciesAnim>({
        definition: 'static const u8 sSpeciesToBackAnimSet[NUM_SPECIES]',
        indexProperty: 'species',
        indexPrefix: 'SPECIES_',
        propHandler: getProp(
          'anim',
          new ConstHandler({ prefix: 'BACK_ANIM_' })
        ),
      }),
    },
  };
