import EggIcon from '@mui/icons-material/Egg';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageIcon from '@mui/icons-material/Image';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  Box,
  createTheme,
  IconButton,
  SvgIcon,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { SyntheticEvent } from 'react';
import PokedexIconSvg from '../../../../assets/icons/pokedex.svg';
import { usePokemonStoreContext } from '../pokemon.store';
import { AddPokemonMenu } from './AddPokemonMenu';
import { PokemonSelect } from './PokemonSelect';
import { SpeciesSelect } from './SpeciesSelect';

export interface PokemonNavBarProps {
  tab: number;
  onTabChange: (event: SyntheticEvent<Element, Event>, value: number) => void;
  onOpenSettings: () => void;
}

export function PokedexIcon(props: any) {
  return <SvgIcon component={PokedexIconSvg} {...props} />;
}

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const PokemonNavBar = observer(
  ({ tab, onTabChange, onOpenSettings }: PokemonNavBarProps) => {
    const pokemonStore = usePokemonStoreContext();

    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    return (
      <AppBar position="sticky">
        <Toolbar>
          <ThemeProvider theme={theme}>
            <Box
              display="flex"
              flexGrow={1}
              gap={1}
              sx={{
                '> *': {
                  flexGrow: 1,
                  maxWidth: '400px',
                },
              }}
            >
              <PokemonSelect />
              <SpeciesSelect />
            </Box>
          </ThemeProvider>

          <AddPokemonMenu />
          <IconButton
            size="large"
            aria-label="Settings"
            aria-haspopup="true"
            onClick={onOpenSettings}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
        {pokemonStore.selectedPokemon && (
          <Tabs
            value={tab}
            onChange={onTabChange}
            aria-label="Pokemon Editor Tabs"
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
          >
            <Tab label="Pokédex" {...a11yProps(0)} icon={<PokedexIcon />} />
            <Tab label="Graphics" {...a11yProps(1)} icon={<ImageIcon />} />
            <Tab
              label="Learnset"
              {...a11yProps(2)}
              icon={<FormatListNumberedIcon />}
            />
            <Tab label="Egg Moves" {...a11yProps(3)} icon={<EggIcon />} />
            {/* <Tab label="TMs" {...a11yProps(4)} icon={<AlbumIcon />} /> */}
          </Tabs>
        )}
      </AppBar>
    );
  }
);
