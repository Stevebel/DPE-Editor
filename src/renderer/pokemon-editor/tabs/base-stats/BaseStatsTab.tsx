import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { TypeLks } from '../../../../common/lookup-values';
import { SelectOption } from '../../../common/Typeahead';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { usePokemonStoreContext } from '../../pokemon.store';

export const BaseStatsTab = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const typeOptions: SelectOption[] = TypeLks.map((type) => ({
    label: type.name,
    value: type.type,
  }));
  console.log(typeOptions);

  if (species) {
    return (
      <Box id="base-stats">
        <Box className="basic-stats common-form">
          <ObservableNumberField
            label="Base HP"
            store={species}
            path={['baseHP']}
          />
          <ObservableNumberField
            label="Base Attack"
            store={species}
            path={['baseAttack']}
          />
          <ObservableNumberField
            label="Base Defense"
            store={species}
            path={['baseDefense']}
          />
          <ObservableNumberField
            label="Base Sp. Attack"
            store={species}
            path={['baseSpAttack']}
          />
          <ObservableNumberField
            label="Base Sp. Defense"
            store={species}
            path={['baseSpDefense']}
          />
          <ObservableNumberField
            label="Base Speed"
            store={species}
            path={['baseSpeed']}
          />
        </Box>
        <Box className="type common-form">
          <ObservableDropdownField
            label="Type 1"
            store={species}
            path={['types', '0']}
            options={typeOptions}
          />

          <ObservableDropdownField
            label="Type 2"
            store={species}
            path={['types', '1']}
            options={typeOptions}
          />
        </Box>

        <Box className="yield common-form">
          <ObservableNumberField
            label="Exp Yield"
            store={species}
            path={['expYield']}
          />

          <ObservableNumberField
            label="EV Yield - HP"
            store={species}
            path={['evYield_HP']}
          />

          <ObservableNumberField
            label="EV Yield - Attack"
            store={species}
            path={['evYield_Attack']}
          />

          <ObservableNumberField
            label="EV Yield - Defense"
            store={species}
            path={['evYield_Defense']}
          />

          <ObservableNumberField
            label="EV Yield - Sp. Attack"
            store={species}
            path={['evYield_SpAttack']}
          />

          <ObservableNumberField
            label="EV Yield - Sp. Defense"
            store={species}
            path={['evYield_SpDefense']}
          />

          <ObservableNumberField
            label="EV Yield - Speed"
            store={species}
            path={['evYield_Speed']}
          />
        </Box>
        <Box className="dropdowns common-form">
          <ObservableTextField
            label="Item 1"
            store={species}
            path={['itemCommon']}
          />

          <ObservableTextField
            label="Item 2"
            store={species}
            path={['itemRare']}
          />

          <ObservableTextField
            label="Egg Group 1"
            store={species}
            path={['eggGroups', '0']}
          />

          <ObservableTextField
            label="Egg Group 2"
            store={species}
            path={['eggGroups', '1']}
          />

          <ObservableTextField
            label="Ability 1"
            store={species}
            path={['abilities', '0']}
          />

          <ObservableTextField
            label="Ability 2"
            store={species}
            path={['abilities', '1']}
          />

          <ObservableTextField
            label="Hidden Ability"
            store={species}
            path={['abilities', '2']}
          />
        </Box>

        <Box className="other common-form">
          <ObservableNumberField
            label="Female Percent"
            store={species}
            path={['genderRatio']}
          />

          <ObservableNumberField
            label="Egg Cycles"
            store={species}
            path={['eggCycles']}
          />

          <ObservableNumberField
            label="Friendship"
            store={species}
            path={['friendship']}
          />

          <ObservableTextField
            label="Growth Rate"
            store={species}
            path={['growthRate']}
          />

          <ObservableNumberField
            label="Catch Rate"
            store={species}
            path={['catchRate']}
          />
        </Box>
      </Box>
    );
  }
  return null;
});
