import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableSwitch } from '../../../common/forms/ObservableSwitch';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { usePokemonStoreContext } from '../../pokemon.store';

export const GraphicsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  if (species) {
    return (
      <Box id="graphics" className="common-form">
        <ObservableSwitch
          label="Override Constant"
          store={species}
          path={['manualSpriteConst']}
        />
        <ObservableTextField
          label="Sprite Constant"
          store={species}
          path={['spriteConst']}
          setter="setSpriteConst"
          disabled={!species.manualSpriteConst}
        />
        <ObservableNumberField
          label="Front Y-Offset"
          store={species}
          path={['frontCoords', 'y_offset']}
        />
        <ObservableNumberField
          label="Front Elevation"
          store={species}
          path={['enemyElevation']}
        />
        <ObservableNumberField
          label="Back Y-Offset"
          store={species}
          path={['backCoords', 'y_offset']}
        />
      </Box>
    );
  }
  return null;
});
