import { z } from 'zod';
import { SpeciesData } from './file-handlers/files/species';
import { typeConsts } from './lookup-values';
import { PokemonSourceData } from './pokemon-source-data.interface';
import { zAddress, zConst, zDexNumber, zLevel, zUByte } from './zod-common';

export const zType = z.enum(typeConsts);
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
  expYield: zUByte,
  evYield_HP: zEVYield,
  evYield_Attack: zEVYield,
  evYield_Defense: zEVYield,
  evYield_SpAttack: zEVYield,
  evYield_SpDefense: zEVYield,
  evYield_Speed: zEVYield,
  item1: zConst,
  item2: zConst,
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

export const PicCoordsSchema = z.object({
  species: zConst,
  size: zUByte,
  y_offset: zUByte,
});

export const EvolutionSchema = z.object({
  method: zConst,
  param: zConst.or(z.number().nonnegative()),
  targetSpecies: zConst,
  extra: zConst.or(z.number().nonnegative()),
});

export const LevelUpMoveSchema = z.object({
  level: zLevel,
  move: zConst,
});

export const ToneDataSchema = z.object({
  species: zConst,
  // type: z.literal(0x20).or(z.literal(0x30)),
  // key: z.literal(0x3c),
  // length: z.literal(0),
  // pan_sweep: z.literal(0),
  // wav: zConst.or(zAddress),
  // attack: z.literal(0xff),
  // decay: z.literal(0),
  // sustain: z.literal(0xff),
  // release: z.literal(0),
  type: z.number().nonnegative(),
  key: z.number().nonnegative(),
  length: z.number().nonnegative(),
  pan_sweep: z.number().nonnegative(),
  wav: zConst.or(zAddress),
  attack: z.number().nonnegative(),
  decay: z.number().nonnegative(),
  sustain: z.number().nonnegative(),
  release: z.number().nonnegative(),
});

export const ItemAnimationSchema = z.object({
  species: zConst,
  anim1: zUByte,
  anim2: zUByte,
  anim3: zUByte,
  anim4: zUByte,
  anim5: zUByte,
});

export const PokemonSpeciesDataSchema = z.object({
  species: zConst,
  speciesNumber: z.number().nonnegative(),
  name: z.string().max(10),
  nameConst: zConst,
  dexEntry: z.string().max(130).optional(),
  dexEntryConst: zConst.or(zAddress),
  frontSprite: z.string().optional(),
  backShinySprite: z.string().optional(),
  iconSprite: z.string().optional(),
  iconPalette: z.number().nonnegative().lte(9).optional(),
  frontCoords: PicCoordsSchema.omit({ species: true }).optional(),
  backCoords: PicCoordsSchema.omit({ species: true }).optional(),
  enemyElevation: z.number().nonnegative(),
  baseStats: BaseStatSchema.partial().optional(),
  evolutions: z.array(EvolutionSchema).optional(),
  learnset: z.array(LevelUpMoveSchema).optional(),
  learnsetConst: zConst.optional(),
  eggMoves: z.array(zConst).optional(),
  cryData: ToneDataSchema.omit({ species: true, type: true }).optional(),
  footprint: zAddress.optional(),
  itemAnimation: ItemAnimationSchema.omit({ species: true }).optional(),
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
export type IPokemonData = z.infer<typeof PokemonDataSchema>;

export type AllPokemonData = {
  pokemon: IPokemonData[];
  species?: SpeciesData[];
  lastNationalDex: number;

  source?: PokemonSourceData;
};
