import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import { PokemonEditor } from './pokemon-editor/PokemonEditor';

export default function App() {
  const theme = createTheme({});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<PokemonEditor />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
