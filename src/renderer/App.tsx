import { ThemeProvider } from '@emotion/react';
import { Box, createTheme, CssBaseline } from '@mui/material';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import NavDrawer from './nav-drawer/NavDrawer';
import { PokemonEditor } from './pokemon-editor/PokemonEditor';
import { SheetImporter } from './sheet-importer/SheetImporter';

export default function App() {
  const theme = createTheme({});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box display="flex" width="100%">
          <NavDrawer />
          <Box flexGrow={1}>
            <Routes>
              <Route path="/" element={<PokemonEditor />} />
              <Route path="/import" element={<SheetImporter />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
