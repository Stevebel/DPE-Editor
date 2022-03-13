import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Box } from '@mui/system';
import { cloneDeep, omit } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { convertToSource } from '../../../common/convert-to-source';
import { IPokemonData } from '../../../common/pokemon-data.interface';
import { usePokemonStoreContext } from '../pokemon.store';

export const SaveButton = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const handleSave = () => {
    setDialogOpen(!dialogOpen);
  };

  const close = () => {
    setDialogOpen(false);
  };

  const save = () => {
    const pokemon: IPokemonData[] = pokemonStore.pokemon.map((p) => ({
      ...p,
      species: p.species.map((s) => cloneDeep(omit(s, 'pokemon'))),
    }));

    const data = {
      pokemon,
      lastNationalDex: pokemon.length - 1,
    };
    convertToSource(data);
    window.electron.ipcRenderer.send('pokemon-source-data', data);
    close();
  };

  const handleCloseMessage = () => {
    setMessageOpen(false);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('data-saved', () => {
      setMessageOpen(true);
    });
  }, []);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Settings"
        aria-haspopup="true"
        onClick={handleSave}
        color="inherit"
      >
        <SaveIcon />
      </IconButton>
      <Dialog
        open={dialogOpen}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Save All Pokémon?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Save all Pokémon to the DPE and CFRU files? This will overwrite many
            files and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={save} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={messageOpen}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
      >
        <Alert
          onClose={handleCloseMessage}
          severity="success"
          sx={{ width: '100%' }}
        >
          Successfully saved all files!
        </Alert>
      </Snackbar>
    </Box>
  );
});
