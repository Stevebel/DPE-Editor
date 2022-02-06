import { observer } from 'mobx-react-lite';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { usePokemonStoreContext } from '../../pokemon.store';

export const LevelUpForm = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  return (
    <Box className="common-form">
      <ObservableNumberField
        label="Level"
        store={species}
        path={['baseStats', 'friendship']}
      />
      <ObservableDropdownField
        label="Move"
        store={species}
        path={['spriteConst']}
        setter="setSpriteConst"
        options={[
          { value: 'MOVE_BABYDOLLEYES', label: 'BABYDOLLEYES' },
          { value: 'MOVE_TACKLE', label: 'TACKLE' },
        ]}
      />
      <Button variant="contained" startIcon={<AddIcon />}>
        Add Move
      </Button>
    </Box>
  );
});
