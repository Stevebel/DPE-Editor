import './App.scss';

import { ThemeProvider } from '@emotion/react';
import { Box, Button, createTheme, Tab, Tabs, TextField } from '@mui/material';
import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';

import { TabPanel } from './common/TabPanel';
import { PokedexTab } from './pokemon-editor/tabs/pokedex/PokedexTab';

const Config = window.electron.store;

const PokemonEditor = () => {
  const [value, setValue] = React.useState(0);
  const [dpeFolder, setDPEFolder] = React.useState(Config.get('dpeFolder'));
  const [cfruFolder, setCFRUFolder] = React.useState(Config.get('cfruFolder'));

  const handleTabChange = (_: any, newValue: number) => {
    setValue(newValue);
  };
  const handleNameChange = (name: string) => {
    console.log('Name:', name);
  };
  const handleSpeciesChange = (species: string) => {
    console.log('Species:', species);
  };
  const handleDPESelect = () => {
    window.electron.ipcRenderer.send('locate-dpe');
  };
  const handleCFRUSelect = () => {
    window.electron.ipcRenderer.send('locate-cfru');
  };

  window.electron.ipcRenderer.on('set-dpe-location', setDPEFolder);
  window.electron.ipcRenderer.on('set-cfru-location', setCFRUFolder);
  window.electron.ipcRenderer.on('pokemon-source-data', (data) => {
    console.log('Pokemon source data:', data);
  });

  window.electron.ipcRenderer.send('load-files');

  const theme = createTheme({
    typography: {
      fontFamily: 'Pokemon',
      button: {
        textTransform: 'none',
      },
    },
  });

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box>
      <ThemeProvider theme={theme}>
        <Box display="flex" alignItems="center" justifyContent="flex-start">
          <TextField
            disabled
            label="DPE Folder"
            value={dpeFolder}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={handleDPESelect}>Select</Button>

          <TextField
            disabled
            label="CFRU Folder"
            value={cfruFolder}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={handleCFRUSelect}>Select</Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Pokédex" {...a11yProps(0)} />
            <Tab label="Graphics" {...a11yProps(1)} />
            <Tab label="Learnset" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <PokedexTab
            onNameChange={handleNameChange}
            onSpeciesChange={handleSpeciesChange}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
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
