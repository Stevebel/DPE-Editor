import AddBoxIcon from '@mui/icons-material/AddBox';
import { IconButton, ListItemText, MenuList, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { SPECIES_LABEL } from '../../consts';
import { usePokemonStoreContext } from '../pokemon.store';

export const AddPokemonMenu = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = anchorEl != null;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAddPokemon = () => {
    handleClose();
    pokemonStore.addPokemon();
  };
  const handleAddSpecies = () => {
    handleClose();
    pokemonStore.addSpecies();
  };

  function getControlModifier(shift?: boolean) {
    if (navigator.platform.indexOf('Mac') >= 0) {
      return `⌘${shift ? '+Shift+' : ''}`;
    }
    return `Ctrl+${shift ? 'Shift+' : ''}`;
  }

  return (
    <div>
      <Button>Dashboard</Button>
      <IconButton
        size="large"
        aria-label="Add Menu"
        id="add-button"
        aria-controls={open ? 'add-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="inherit"
      >
        <AddBoxIcon />
      </IconButton>
      <Menu
        id="add-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuList sx={{ width: 200, outline: 'none' }}>
          <MenuItem onClick={handleAddPokemon}>
            <ListItemText>New Pokémon</ListItemText>
            <Typography variant="body2" color="text.secondary">
              {getControlModifier()}1
            </Typography>
          </MenuItem>
          {pokemonStore.selectedPokemon && (
            <MenuItem onClick={handleAddSpecies}>
              <ListItemText>New {SPECIES_LABEL}</ListItemText>
              <Typography variant="body2" color="text.secondary">
                {getControlModifier()}2
              </Typography>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
});
