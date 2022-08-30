import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Box } from '@mui/system';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { usePokemonStoreContext } from '../pokemon.store';

export const DeleteButton = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { selectedPokemon } = pokemonStore;
  const selectedPokemonName = selectedPokemon
    ? selectedPokemon.species[0].name
    : 'Unknown';

  const handleDelete = () => {
    setDialogOpen(!dialogOpen);
  };

  const close = () => {
    setDialogOpen(false);
  };

  const deletePokemon = () => {
    if (selectedPokemon) {
      pokemonStore.removePokemon(selectedPokemon);
    }
    close();
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Settings"
        aria-haspopup="true"
        onClick={handleDelete}
        color="inherit"
      >
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={dialogOpen}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete {selectedPokemonName}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Permanently delete {selectedPokemonName} from the source files?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={deletePokemon} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
