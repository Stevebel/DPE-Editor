import ICON_BUG from '../icons/Pokémon_Bug_Type_Icon.svg';
import ICON_DARK from '../icons/Pokémon_Dark_Type_Icon.svg';
import ICON_DRAGON from '../icons/Pokémon_Dragon_Type_Icon.svg';
import ICON_ELECTRIC from '../icons/Pokémon_Electric_Type_Icon.svg';
import ICON_FAIRY from '../icons/Pokémon_Fairy_Type_Icon.svg';
import ICON_FIGHTING from '../icons/Pokémon_Fighting_Type_Icon.svg';
import ICON_FIRE from '../icons/Pokémon_Fire_Type_Icon.svg';
import ICON_FLYING from '../icons/Pokémon_Flying_Type_Icon.svg';
import ICON_GHOST from '../icons/Pokémon_Ghost_Type_Icon.svg';
import ICON_GRASS from '../icons/Pokémon_Grass_Type_Icon.svg';
import ICON_GROUND from '../icons/Pokémon_Ground_Type_Icon.svg';
import ICON_ICE from '../icons/Pokémon_Ice_Type_Icon.svg';
import ICON_NORMAL from '../icons/Pokémon_Normal_Type_Icon.svg';
import ICON_POISON from '../icons/Pokémon_Poison_Type_Icon.svg';
import ICON_PSYCHIC from '../icons/Pokémon_Psychic_Type_Icon.svg';
import ICON_ROCK from '../icons/Pokémon_Rock_Type_Icon.svg';
import ICON_STEEL from '../icons/Pokémon_Steel_Type_Icon.svg';
import ICON_WATER from '../icons/Pokémon_Water_Type_Icon.svg';

type TypeIconProps = {
  type: string;
};

export function TypeIcon({ type }: TypeIconProps) {
  switch (type) {
    case 'BUG':
      return <ICON_BUG />;
    case 'DARK':
      return <ICON_DARK />;
    case 'DRAGON':
      return <ICON_DRAGON />;
    case 'ELECTRIC':
      return <ICON_ELECTRIC />;
    case 'FAIRY':
      return <ICON_FAIRY />;
    case 'FIGHTING':
      return <ICON_FIGHTING />;
    case 'FIRE':
      return <ICON_FIRE />;
    case 'FLYING':
      return <ICON_FLYING />;
    case 'GHOST':
      return <ICON_GHOST />;
    case 'GRASS':
      return <ICON_GRASS />;
    case 'GROUND':
      return <ICON_GROUND />;
    case 'ICE':
      return <ICON_ICE />;
    case 'NORMAL':
      return <ICON_NORMAL />;
    case 'POISON':
      return <ICON_POISON />;
    case 'PSYCHIC':
      return <ICON_PSYCHIC />;
    case 'ROCK':
      return <ICON_ROCK />;
    case 'STEEL':
      return <ICON_STEEL />;
    case 'WATER':
      return <ICON_WATER />;
    default:
      return <svg />;
  }
}
