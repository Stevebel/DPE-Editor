import { z } from 'zod';
import { SpeciesData } from './file-handlers/files/species';
import { EvolutionSchema, habitatConsts, typeConsts } from './lookup-values';
import { PokemonSourceData } from './pokemon-source-data.interface';
import { zConst, zDexNumber, zLevel, zUByte } from './zod-common';

export const zType = z.enum(typeConsts);
export const zHabitat = z.enum(habitatConsts);
export const zEVYield = z.number().nonnegative().lte(3);

export const BaseStatSchema = z.object({
  species: zConst,
  baseHP: zUByte,
  baseAttack: zUByte,
  baseDefense: zUByte,
  baseSpAttack: zUByte,
  baseSpDefense: zUByte,
  baseSpeed: zUByte,

  type1: zType,
  type2: zType,
  catchRate: zUByte,
  expYield: z.number().nonnegative(),
  evYield_HP: zEVYield,
  evYield_Attack: zEVYield,
  evYield_Defense: zEVYield,
  evYield_SpAttack: zEVYield,
  evYield_SpDefense: zEVYield,
  evYield_Speed: zEVYield,
  item1: zConst.optional(),
  item2: zConst.optional(),
  genderRatio: z.number().gte(-1).lte(100),
  eggCycles: zUByte,
  friendship: zUByte,
  growthRate: zConst,
  eggGroup1: zConst,
  eggGroup2: zConst,
  ability1: zConst,
  ability2: zConst,
  hiddenAbility: zConst,
  safariZoneFleeRate: zUByte,
  noFlip: z.boolean(),
});

export const SizeCoordsSchema = z.object({
  width: zUByte,
  height: zUByte,
});
export const PicCoordsSchema = z.object({
  species: zConst,
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

export const PokemonSpeciesDataSchema = z.object({
  species: zConst,
  speciesNumber: z.number().nonnegative(),
  name: z.string().max(10),
  nameConst: zConst,
  prettyConst: zConst,
  dexEntry: z.string().max(170).optional(),
  dexEntryConst: zConst,
  graphics: GraphicsFilesSchema,
  femaleGraphics: GraphicsFilesSchema.optional(),
  frontCoords: PicCoordsSchema.omit({ species: true }).optional(),
  backCoords: PicCoordsSchema.omit({ species: true }).optional(),
  enemyElevation: z.number().nonnegative(),
  frontAnimId: zConst.optional(),
  backAnimId: zConst.optional(),
  animationDelay: zUByte.optional(),
  baseStats: BaseStatSchema.partial().optional(),
  evolutions: z.array(EvolutionSchema).optional(),
  learnset: z.array(LevelUpMoveSchema).optional(),
  learnsetConst: zConst.optional(),
  teachableMoves: z.array(zConst).optional(),
  teachableMovesConst: zConst.optional(),
  eggMoves: z.array(zConst).optional(),
  footprint: GraphicFileSchema.optional(),
  isAdditional: z.boolean(),
  regionalDexNumber: zDexNumber.optional(),
});

export const PokemonDataSchema = z.object({
  nationalDex: zConst,
  regionalDexNumber: zDexNumber.optional(),
  nationalDexNumber: zDexNumber,

  categoryName: z.string().max(12),
  height: z.number().nonnegative().lte(100.0),
  weight: z.number().nonnegative().lte(999.9),
  pokemonScale: z.number().nonnegative(),
  pokemonOffset: z.number().nonnegative(),
  trainerScale: z.number().nonnegative(),
  trainerOffset: z.number().nonnegative(),

  species: z.array(PokemonSpeciesDataSchema),
});

export type BaseStatData = z.infer<typeof BaseStatSchema>;
export type IPokemonSpeciesData = z.infer<typeof PokemonSpeciesDataSchema>;
export type Evo = z.infer<typeof EvolutionSchema>;
export type IPokemonData = z.infer<typeof PokemonDataSchema>;

export type AllPokemonData = {
  pokemon: IPokemonData[];
  species?: SpeciesData[];

  source?: PokemonSourceData;
};

export type ImportedRow = {
  basedOn: string;
} & IPokemonData;
