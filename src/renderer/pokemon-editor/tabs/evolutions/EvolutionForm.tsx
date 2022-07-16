import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  EvolutionMethods,
  getMethodGroup,
  TypeLks,
} from '../../../../common/lookup-values';
import { MoveDropdown } from '../../../common/forms/MoveDropdown';
import { ObservableDropdownField } from '../../../common/forms/ObservableDropdownField';
import { ObservableNumberField } from '../../../common/forms/ObservableNumberField';
import { ObservableTextField } from '../../../common/forms/ObservableTextField';
import { SelectOption } from '../../../common/Typeahead';
import { usePokemonStoreContext } from '../../pokemon.store';

export interface EvolutionFormProps {
  index: number;
  addEvolutionHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteEvolutionHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const EvolutionForm = observer((props: EvolutionFormProps) => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const { index, addEvolutionHandler, deleteEvolutionHandler } = props;

  const methodOptions: SelectOption[] = EvolutionMethods.map((method) => ({
    label: method,
    value: method,
  }));
  const speciesOptions: SelectOption[] = pokemonStore.allSpecies.map((s) => ({
    label: s.nameConst,
    value: s.nameConst,
  }));
  const typeOptions: SelectOption[] = TypeLks.map((type) => ({
    label: type.name,
    value: type.type,
  }));

  if (species) {
    const evolution = species.evolutions[index];

    // eslint-disable-next-line no-inner-declarations
    function getSelectedMethodGroup() {
      return getMethodGroup(evolution.method);
    }

    return (
      <>
        <Box
          className="common-form"
          sx={{
            '&:hover': {
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <ObservableDropdownField
            label="Method"
            store={species}
            path={['evolutions', index, 'method']}
            options={methodOptions}
          />
          <ObservableDropdownField
            label="Target Species"
            store={species}
            path={['evolutions', index, 'targetSpecies']}
            options={speciesOptions}
          />
          {getSelectedMethodGroup() === 'level' && (
            <ObservableNumberField
              label="Level"
              store={species}
              path={['evolutions', index, 'param']}
            />
          )}
          {getSelectedMethodGroup() === 'type' && (
            <>
              <ObservableDropdownField
                label="Type"
                store={species}
                path={['evolutions', index, 'param']}
                options={typeOptions}
              />
              <ObservableNumberField
                label="Level"
                store={species}
                path={['evolutions', index, 'extra']}
              />
            </>
          )}
          {getSelectedMethodGroup() === 'item' && (
            <ObservableTextField
              label="Item"
              store={species}
              path={['evolutions', index, 'param']}
            />
          )}
          {getSelectedMethodGroup() === 'map' && (
            <ObservableTextField
              label="Map"
              store={species}
              path={['evolutions', index, 'param']}
            />
          )}
          {getSelectedMethodGroup() === 'move' && (
            <MoveDropdown
              label="Move"
              store={species}
              path={['evolutions', index, 'param']}
            />
          )}
          {getSelectedMethodGroup() === 'otherSpecies' && (
            <ObservableDropdownField
              label="Other Species"
              store={species}
              path={['evolutions', index, 'param']}
              options={speciesOptions}
            />
          )}
          {getSelectedMethodGroup() === 'levelAndTime' && (
            <>
              <ObservableNumberField
                label="Level"
                store={species}
                path={['evolutions', index, 'param']}
              />
              <ObservableNumberField
                label="Time"
                store={species}
                path={['evolutions', index, 'extra']}
              />
            </>
          )}
          {getSelectedMethodGroup() === 'flag' && (
            <ObservableTextField
              label="Flag"
              store={species}
              path={['evolutions', index, 'param']}
            />
          )}
          {getSelectedMethodGroup() === 'mega' && (
            <>
              <ObservableTextField
                label="Mega Stone"
                store={species}
                path={['evolutions', index, 'param']}
              />
              <ObservableTextField
                label="Mega Variant"
                store={species}
                path={['evolutions', index, 'extra']}
              />
            </>
          )}

          <Box
            sx={{
              button: {
                marginRight: 1,
                marginTop: 1,
              },
            }}
          >
            <IconButton
              data-index={index}
              color="primary"
              onClick={addEvolutionHandler}
              title="Add new evolution"
            >
              <AddIcon />
            </IconButton>
            <IconButton
              data-index={index}
              onClick={deleteEvolutionHandler}
              color="error"
              title="Remove this evolution"
            >
              <RemoveIcon />
            </IconButton>
          </Box>
        </Box>
      </>
    );
  }
  return null;
});
