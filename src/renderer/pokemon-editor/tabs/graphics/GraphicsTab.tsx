import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { usePokemonStoreContext } from '../../pokemon.store';
import { BattlePreview } from './BattlePreview';
import { BoxIconPreview } from './BoxIconPreview';

export const GraphicsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;

  if (species) {
    return (
      <Box id="graphics">
        <Box id="graphics-form" className="common-form">
          <ObservableTextField
            label="Graphics Folder"
            store={species}
            path={['graphicsFolder']}
            disabled
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

        <Box
          id="graphics-preview"
          style={{
            display: 'flex',
            alignItems: 'start',
            marginTop: '20px',
            gap: '20px',
          }}
        >
          <BattlePreview />
          <BoxIconPreview />
        </Box>
      </Box>
    );
  }
  return null;
});
