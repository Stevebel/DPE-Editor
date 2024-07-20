import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ImportedRow } from '../../common/pokemon-data.interface';
import EnhancedTable, { HeaderCell } from '../common/DataTable';
import {
  PokemonSpeciesData,
  usePokemonStoreContext,
} from '../pokemon-editor/pokemon.store';

export const SheetImporter = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const [data, setData] = React.useState<ImportedRow[]>([]);
  const [selected, setSelected] = React.useState<readonly ImportedRow[]>([]);

  useEffect(() => {
    const clearDataListener = window.electron.ipcRenderer.on(
      'spreadsheet-data',
      (newData) => {
        // eslint-disable-next-line no-console
        console.log('Spreadsheet data:', newData);
        setData(newData);
      }
    );

    if (data.length === 0) {
      window.electron.ipcRenderer.send('request-spreadsheet');
    }

    return () => {
      clearDataListener();
    };
  }, [data]);

  function onSelect(newSelected: readonly ImportedRow[]) {
    setSelected(newSelected);
  }

  function importSelected() {
    selected.forEach((newMon) => {
      // Check if the mon already exists in the store
      let baseMon = pokemonStore.pokemon.find(
        (mon) => mon.name === newMon.name
      );
      if (!baseMon) {
        // Otherwise, use "based on" mon
        baseMon = pokemonStore.pokemon.find((mon) => {
          if (newMon.basedOn.includes('Alolan')) {
            const splitName = newMon.basedOn.split('-');
            return mon.species[0].name === splitName[1];
          }
          return mon.species[0].name === newMon.basedOn;
        });
        if (!baseMon) {
          // eslint-disable-next-line no-console
          console.error(
            'Could not find based on:',
            newMon.basedOn,
            'for',
            newMon.species[0].name
          );
        } else {
          baseMon = pokemonStore.addPokemon(baseMon);
          baseMon.species[0].setPokemonName(newMon.name);
        }
      }
      // Merge new mon into base mon
      if (baseMon) {
        baseMon.name = newMon.name;
        baseMon.regionalDexNumber = newMon.regionalDexNumber;
        baseMon.nationalDexNumber = newMon.nationalDexNumber;
        baseMon.categoryName = newMon.categoryName;
        baseMon.height = newMon.height;
        baseMon.weight = newMon.weight;
        baseMon.setDexEntry(newMon.dexEntry.join('\n'));
        baseMon.pokemonOffset ||= newMon.pokemonOffset;
        baseMon.pokemonScale ||= newMon.pokemonScale;
        baseMon.trainerOffset ||= newMon.trainerOffset;
        baseMon.trainerScale ||= newMon.trainerScale;
        baseMon.exclude = false;
        const species = {
          ...baseMon.species[0],
          ...newMon.species[0],
        };
        baseMon.species[0] = new PokemonSpeciesData(baseMon, species);
      }
    });
  }

  const headers: Array<HeaderCell<ImportedRow>> = [
    {
      id: 'regionalDexNumber',
      label: '#',
    },
    {
      id: 'name',
      label: 'Name',
    },
    {
      id: 'basedOn',
      label: 'Based On',
    },
    {
      id: 'categoryName',
      label: 'Category',
    },
  ];

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Google Sheet Importer
          </Typography>
        </Toolbar>
      </AppBar>
      <EnhancedTable
        title="Imported Garticmon"
        rows={data}
        keyProp="name"
        headers={headers}
        onSelect={(newSelected) => onSelect(newSelected)}
      />
      {selected.length > 0 && (
        <Button onClick={() => importSelected()}>Import</Button>
      )}
    </Box>
  );
});
