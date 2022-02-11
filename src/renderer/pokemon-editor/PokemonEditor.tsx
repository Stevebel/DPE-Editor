import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { TabPanel } from '../common/TabPanel';
import { SettingsDialog } from '../SettingsDialog';
import { PokemonNavBar } from './nav-bar/PokemonNavBar';
import { usePokemonStoreContext } from './pokemon.store';
import { BaseStatsTab } from './tabs/base-stats/BaseStatsTab';
import { GraphicsTab } from './tabs/graphics/GraphicsTab';
import { LearnsetsTab } from './tabs/learnsets/LearnsetsTab';
import { PokedexTab } from './tabs/pokedex/PokedexTab';

// eslint-disable-next-line import/prefer-default-export
export const PokemonEditor = observer(() => {
  const [tab, setTab] = React.useState(0);
  const [showSettings, setShowSettings] = React.useState(false);
  const pokemonData = usePokemonStoreContext();

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
  };
  useEffect(() => {
    const clearDataListener = window.electron.ipcRenderer.on(
      'lookup-values',
      (data) => {
        console.log('Lookup data:', data);
      }
    );

    window.electron.ipcRenderer.send('load-files');

    console.log('Pokemon Data:', pokemonData);

    return () => {
      clearDataListener();
    };
  }, [pokemonData]);

  return (
    <Box>
      <PokemonNavBar
        onOpenSettings={() => setShowSettings(true)}
        tab={tab}
        onTabChange={handleTabChange}
      />
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      {(pokemonData.selectedPokemon && (
        <Box id="tabs">
          <TabPanel value={tab} index={0}>
            <PokedexTab />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <GraphicsTab />
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <BaseStatsTab />
          </TabPanel>
          <TabPanel value={tab} index={3}>
            <LearnsetsTab />
          </TabPanel>
          <TabPanel value={tab} index={4}>
            Item Five
          </TabPanel>
        </Box>
      )) || (
        <Typography variant="h6" margin={3}>
          No Pokémon selected
        </Typography>
      )}
    </Box>
  );
});
