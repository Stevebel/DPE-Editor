import EggIcon from '@mui/icons-material/Egg';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageIcon from '@mui/icons-material/Image';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  IconButton,
  SvgIcon,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import { SyntheticEvent } from 'react';
import PokedexIconSvg from '../../../../assets/icons/pokedex.svg';

export interface PokemonNavBarProps {
  tab: number;
  onTabChange: (event: SyntheticEvent<Element, Event>, value: number) => void;
  onOpenSettings: () => void;
}

export function PokedexIcon(props: any) {
  return <SvgIcon component={PokedexIconSvg} {...props} />;
}

export const PokemonNavBar = ({
  tab,
  onTabChange,
  onOpenSettings,
}: PokemonNavBarProps) => {
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Pokemon Name Here
        </Typography>

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
      <Tabs
        value={tab}
        onChange={onTabChange}
        aria-label="basic tabs example"
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
    </AppBar>
  );
};
