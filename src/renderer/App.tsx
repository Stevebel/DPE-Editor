import { ThemeProvider } from '@emotion/react';
import { Box, createTheme, CssBaseline } from '@mui/material';
import React, { useEffect } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import { TabPanel } from './common/TabPanel';
import { PokemonNavBar } from './pokemon-editor/nav-bar/PokemonNavBar';
import { PokedexTab } from './pokemon-editor/tabs/pokedex/PokedexTab';
import { SettingsDialog } from './SettingsDialog';

const PokemonEditor = () => {
  const [tab, setTab] = React.useState(0);
  const [showSettings, setShowSettings] = React.useState(false);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
  };
  const handleNameChange = (name: string) => {
    console.log('Name:', name);
  };
  const handleSpeciesChange = (species: string) => {
    console.log('Species:', species);
  };

  useEffect(() => {
    const clearDataListener = window.electron.ipcRenderer.on(
      'pokemon-source-data',
      (data) => {
        console.log('Pokemon source data:', data);
      }
    );
    window.electron.ipcRenderer.send('load-files');
    return () => {
      clearDataListener();
    };
  }, []);

  const theme = createTheme({});

  return (
    <Box>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PokemonNavBar
          onOpenSettings={() => setShowSettings(true)}
          tab={tab}
          onTabChange={handleTabChange}
        />
        <SettingsDialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
        <TabPanel value={tab} index={0}>
          <PokedexTab
            onNameChange={handleNameChange}
            onSpeciesChange={handleSpeciesChange}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={tab} index={2}>
          Item Three
        </TabPanel>
        <TabPanel value={tab} index={3}>
          Item Four
        </TabPanel>
        <TabPanel value={tab} index={4}>
          Item Five
        </TabPanel>
      </ThemeProvider>
    </Box>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonEditor />} />
      </Routes>
    </Router>
  );
}
