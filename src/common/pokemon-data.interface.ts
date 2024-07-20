import { z } from 'zod';
import { Evolution } from './file-handlers/files/evolution-table';
import { LevelUpMove } from './file-handlers/files/level-up-learnsets';
import { EvolutionSchema, habitatConsts, typeConsts } from './lookup-values';
import { zConst, zDexNumber, zLevel, zUByte } from './zod-common';

export const zType = z.enum(typeConsts);
export const zHabitat = z.enum(habitatConsts);
export const zEVYield = z.number().nonnegative().lte(3).optional();

export const SizeCoordsSchema = z.object({
  width: zUByte,
  height: zUByte,
});
export const PicCoordsSchema = z.object({
  size: SizeCoordsSchema,
  y_offset: zUByte,
});

export const LevelUpMoveSchema = z.object({
  level: zLevel,
  move: zConst,
});

export const GraphicFileSchema = z.object({
  name: zConst,
  file: z.string(),
});

export const GraphicsFilesSchema = z.object({
  frontSprite: GraphicFileSchema.optional(),
  backSprite: GraphicFileSchema.optional(),
  palette: GraphicFileSchema.optional(),
  shinyPalette: GraphicFileSchema.optional(),
  iconSprite: GraphicFileSchema.optional(),
  iconPalette: z.number().nonnegative().lte(9).optional(),
});

export const AnimFrameSchema = z.object({
  frame: z.number().nonnegative(),
  duration: z.number().nonnegative(),
});

export const PokemonSpeciesDataSchema = z.object({
  species: zConst,
  name: z.string().max(12),
  frontCoords: PicCoordsSchema.optional(),
  backCoords: PicCoordsSchema.optional(),
  enemyElevation: z.number().nonnegative(),
  frontAnimId: zConst.optional(),
  backAnimId: zConst.optional(),
  evolutions: z.array(EvolutionSchema).optional(),
  baseHP: zUByte,
  baseAttack: zUByte,
  baseDefense: zUByte,
  baseSpAttack: zUByte,
  baseSpDefense: zUByte,
  baseSpeed: zUByte,
  types: z.array(zType).length(2),
  catchRate: zUByte,
  expYield: z.number().nonnegative(),
  evYield_HP: zEVYield,
  evYield_Attack: zEVYield,
  evYield_Defense: zEVYield,
  evYield_SpAttack: zEVYield,
  evYield_SpDefense: zEVYield,
  evYield_Speed: zEVYield,
  itemCommon: zConst.optional(),
  itemRare: zConst.optional(),
  genderRatio: z.number().gte(-1).lte(100),
  eggCycles: zUByte,
  friendship: zUByte,
  growthRate: zConst,
  eggGroups: z.array(zConst).length(2),
  abilities: z.array(zConst.or(z.null())).length(3),
  bodyColor: zConst,
  noFlip: z.boolean(),
  graphicsFolder: zConst,
  hasFemaleGraphics: z.boolean().optional(),
  hasFrontAnim: z.boolean().optional(),
  animationDelay: zUByte.optional(),
  exclude: z.boolean(),
});

export const PokemonDataSchema = z.object({
  name: z.string().max(12),
  regionalDexNumber: zDexNumber.optional(),
  nationalDexNumber: zDexNumber,

  categoryName: z.string().max(14),
  height: z.number().nonnegative().lte(100.0),
  weight: z.number().nonnegative().lte(999.9),
  pokemonScale: z.number().nonnegative(),
  pokemonOffset: z.number().nonnegative(),
  trainerScale: z.number().nonnegative(),
  trainerOffset: z.number().nonnegative(),

  species: z.array(PokemonSpeciesDataSchema),

  dexEntry: z.array(z.string()).max(4),
  exclude: z.boolean(),
});

export const PokemonLearnsetSchema = z.object({
  species: zConst,
  levelUp: z.array(LevelUpMoveSchema).optional(),
  teachable: z.array(zConst).optional(),
  egg: z.array(zConst).optional(),
  exclude: z.boolean(),
});

export type IPokemonSpeciesData = Omit<
  z.infer<typeof PokemonSpeciesDataSchema>,
  'evolutions'
> & {
  evolutions: Evolution[];
};
export type Evo = z.infer<typeof EvolutionSchema>;
export type IPokemonData = Omit<
  z.infer<typeof PokemonDataSchema>,
  'species'
> & {
  species: Array<IPokemonSpeciesData>;
};
export type ILearnset = Omit<
  z.infer<typeof PokemonLearnsetSchema>,
  'levelUp'
> & {
  levelUp: LevelUpMove[];
};
export type PokemonType = z.infer<typeof zType>;

export type AllPokemonData = {
  pokemon: IPokemonData[];
  learnset: ILearnset[];
};

export type ImportedRow = {
  basedOn: string;
  learnset: Partial<ILearnset>;
} & PartialPokemonData;

export interface PartialPokemonData extends Omit<IPokemonData, 'species'> {
  species: Array<Partial<IPokemonSpeciesData>>;
}
