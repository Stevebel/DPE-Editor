export type TypeLk = {
  type: string;
  name: string;
  order: number;
};

export const TypeLks: TypeLk[] = [
  { type: 'NONE', name: '', order: -1 },
  { type: 'NORMAL', name: 'Normal', order: 0 },
  { type: 'FIGHTING', name: 'Fighting', order: 1 },
  { type: 'FLYING', name: 'Flying', order: 2 },
  { type: 'POISON', name: 'Poison', order: 3 },
  { type: 'GROUND', name: 'Ground', order: 4 },
  { type: 'ROCK', name: 'Rock', order: 5 },
  { type: 'BUG', name: 'Bug', order: 6 },
  { type: 'GHOST', name: 'Ghost', order: 7 },
  { type: 'STEEL', name: 'Steel', order: 8 },
  // { type: 'MYSTERY', name: 'Mystery', order: 9},
  { type: 'FIRE', name: 'Fire', order: 10 },
  { type: 'WATER', name: 'Water', order: 11 },
  { type: 'GRASS', name: 'Grass', order: 12 },
  { type: 'ELECTRIC', name: 'Electric', order: 13 },
  { type: 'PSYCHIC', name: 'Psychic', order: 14 },
  { type: 'ICE', name: 'Ice', order: 15 },
  { type: 'DRAGON', name: 'Dragon', order: 16 },
  { type: 'DARK', name: 'Dark', order: 17 },
  // { type: 'ROOSTLESS', name: 'Roostless', order: 19},
  // { type: 'BLANK', name: 'Blank', order: 20},
  { type: 'FAIRY', name: 'Fairy', order: 23 },
];

export const TypeOrder = TypeLks.reduce((order, t) => {
  order[t.type] = t.order;
  return order;
}, {} as { [key: string]: number });

export const MAX_TYPE_ORDER = TypeLks[TypeLks.length - 1].order;
