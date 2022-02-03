import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { TypeLks } from '../../../../common/lookup-values';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { SelectOption } from '../../../common/Typeahead';
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
            path={['baseStats', 'baseHP']}
          />
          <ObservableNumberField
            label="Base Attack"
            store={species}
            path={['baseStats', 'baseAttack']}
          />
          <ObservableNumberField
            label="Base Defense"
            store={species}
            path={['baseStats', 'baseDefense']}
          />
          <ObservableNumberField
            label="Base Sp. Attack"
            store={species}
            path={['baseStats', 'baseSpAttack']}
          />
          <ObservableNumberField
            label="Base Sp. Defense"
            store={species}
            path={['baseStats', 'baseSpDefense']}
          />
          <ObservableNumberField
            label="Base Speed"
            store={species}
            path={['baseStats', 'baseSpeed']}
          />
        </Box>
        <Box className="type common-form">
          <ObservableDropdownField
            label="Type 1"
            store={species}
            path={['baseStats', 'type1']}
            options={typeOptions}
          />

          <ObservableDropdownField
            label="Type 2"
            store={species}
            path={['baseStats', 'type2']}
            options={typeOptions}
          />
        </Box>

        <Box className="yield common-form">
          <ObservableNumberField
            label="Exp Yield"
            store={species}
            path={['baseStats', 'expYield']}
          />

          <ObservableNumberField
            label="EV Yield - HP"
            store={species}
            path={['baseStats', 'evYield_HP']}
          />

          <ObservableNumberField
            label="EV Yield - Attack"
            store={species}
            path={['baseStats', 'evYield_Attack']}
          />

          <ObservableNumberField
            label="EV Yield - Defense"
            store={species}
            path={['baseStats', 'evYield_Defense']}
          />

          <ObservableNumberField
            label="EV Yield - Sp. Attack"
            store={species}
            path={['baseStats', 'evYield_SpAttack']}
          />

          <ObservableNumberField
            label="EV Yield - Sp. Defense"
            store={species}
            path={['baseStats', 'evYield_SpDefense']}
          />

          <ObservableNumberField
            label="EV Yield - Speed"
            store={species}
            path={['baseStats', 'evYield_Speed']}
          />
        </Box>
        <Box className="dropdowns common-form">
          <ObservableTextField
            label="Item 1"
            store={species}
            path={['baseStats', 'item1']}
          />

          <ObservableTextField
            label="Item 2"
            store={species}
            path={['baseStats', 'item2']}
          />

          <ObservableTextField
            label="Egg Group 1"
            store={species}
            path={['baseStats', 'eggGroup1']}
          />

          <ObservableTextField
            label="Egg Group 2"
            store={species}
            path={['baseStats', 'eggGroup2']}
          />

          <ObservableTextField
            label="Ability 1"
            store={species}
            path={['baseStats', 'ability1']}
          />

          <ObservableTextField
            label="Ability 2"
            store={species}
            path={['baseStats', 'ability2']}
          />

          <ObservableTextField
            label="Hidden Ability"
            store={species}
            path={['baseStats', 'hiddenAbility']}
          />
        </Box>

        <Box className="other common-form">
          <ObservableNumberField
            label="Female Percent"
            store={species}
            path={['baseStats', 'genderRatio']}
          />

          <ObservableNumberField
            label="Egg Cycles"
            store={species}
            path={['baseStats', 'eggCycles']}
          />

          <ObservableNumberField
            label="Friendship"
            store={species}
            path={['baseStats', 'friendship']}
          />

          <ObservableTextField
            label="Growth Rate"
            store={species}
            path={['baseStats', 'growthRate']}
          />

          <ObservableNumberField
            label="Catch Rate"
            store={species}
            path={['baseStats', 'catchRate']}
          />

          <ObservableNumberField
            label="Safari Zone Flee Rate"
            store={species}
            path={['baseStats', 'safariZoneFleeRate']}
          />
        </Box>
      </Box>
    );
  }
  return null;
});
