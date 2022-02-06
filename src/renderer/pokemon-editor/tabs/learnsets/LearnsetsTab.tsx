import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { observer } from 'mobx-react-lite';
import { usePokemonStoreContext } from '../../pokemon.store';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { LevelUpForm } from './LevelUpForm';

export const LearnsetsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  if (species) {
    return (
      <Box id="learnsets">
        <LevelUpForm />
        <LevelUpForm />
        <LevelUpForm />
      </Box>
    );
  }
  return null;
});
