import { observer } from 'mobx-react-lite';
import { usePokemonStoreContext } from '../../pokemon.store';

export const BoxIconPreview = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;

  function getSprite() {
    return `asset://${species!.nameConst.toLowerCase()}/icons.png`;
  }

  if (species) {
    return (
      <img
        src={getSprite()}
        alt={species.name}
        style={{
          imageRendering: 'pixelated',
          width: '96px',
        }}
      />
    );
  }
  return null;
});
