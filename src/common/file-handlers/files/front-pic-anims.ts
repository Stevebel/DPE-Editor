import { SourceFileDefinition } from '../file-handler.interface';
import { ArrayHandler } from '../handlers/array-handler';
import { ConstDefinitionHandler } from '../handlers/const-definitions-handler';
import { ConstHandler, DefaultConstHandler } from '../handlers/const-handler';
import { FunctionArrayHandler } from '../handlers/function-array-handler';
import { IntHandler } from '../handlers/number-handlers';
import { getProp } from '../handlers/struct-handler';

export type FrontPicAnims = {
  anims: AnimationDef[];
  animCollections: AnimationCollectionDef[];
  animTable: AnimationMapping[];
};

export type AnimationDef = {
  animConst: string;
  animFrames: AnimFrame[];
};

export type AnimFrame = {
  frame: number;
  duration: number;
};

export type AnimationCollectionDef = {
  animCollectionConst: string;
  anims: string[];
};

export type AnimationMapping = {
  species: string;
  animCollectionConst: string;
};

export const FrontPicAnimsSourceDef: SourceFileDefinition<FrontPicAnims> = {
  location: [
    {
      folder: 'src',
      fileName: 'src/data/pokemon_graphics/front_pic_anims.h',
    },
  ],
  schema: {
    anims: new ConstDefinitionHandler<AnimationDef>({
      indexProperty: 'animConst',
      definitionPrefix: 'static const union AnimCmd sAnim_',
      definitionSuffix: '[]',
      propHandler: getProp(
        'animFrames',
        new FunctionArrayHandler<AnimFrame>({
          functionConfig: {
            functionName: 'ANIMCMD_FRAME',
            parameterProps: [
              getProp('frame', IntHandler),
              getProp('duration', IntHandler),
            ],
          },
          terminator: 'ANIMCMD_END',
        })
      ),
    }),
    animCollections: new ConstDefinitionHandler<AnimationCollectionDef>({
      indexProperty: 'animCollectionConst',
      definitionPrefix: 'static const union AnimCmd *const sAnims_',
      definitionSuffix: '[]',
      propHandler: getProp(
        'anims',
        new ArrayHandler({
          itemHandler: new ConstHandler({ prefix: 'sAnim_' }),
        })
      ),
    }),
    animTable: new FunctionArrayHandler<AnimationMapping>({
      definition:
        'static const union AnimCmd *const *const gMonFrontAnimsPtrTable[]',
      functionConfig: {
        functionName: 'ANIM_CMD',
        parameterProps: [
          getProp('species', DefaultConstHandler),
          getProp(
            'animCollectionConst',
            new ConstHandler({ prefix: 'sAnims_' })
          ),
        ],
      },
    }),
  },
};
