import {
  Box,
  Button,
  FormControl,
  Modal,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}
const Config = window.electron.store;

const dialogStyle: SxProps<Theme> = {
  position: 'absolute',
  top: '50px',
  left: '50%',
  width: 'calc(100% - 20px)',
  maxWidth: 1300,
  transform: 'translate(-50%, 0)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};
const folderInputStyle: SxProps<Theme> = {
  flexDirection: 'row',
  flexGrow: 1,
  mt: 2,
  flexBasis: 550,
};

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const [dpeFolder, setDPEFolder] = React.useState(Config.get('dpeFolder'));
  const [cfruFolder, setCFRUFolder] = React.useState(Config.get('cfruFolder'));
  const [assetsFolder, setAssetsFolder] = React.useState(
    Config.get('assetsFolder')
  );
  const [googleKeyLocation, setGoogleKeyLocation] = React.useState(
    Config.get('googleKeyLocation')
  );

  const handleDPESelect = () => {
    window.electron.ipcRenderer.send('locate-dpe');
  };
  const handleCFRUSelect = () => {
    window.electron.ipcRenderer.send('locate-cfru');
  };
  const handleAssetsSelect = () => {
    window.electron.ipcRenderer.send('locate-assets');
  };

  const handleGoogleKeySelect = () => {
    window.electron.ipcRenderer.send('locate-google-key');
  };

  useEffect(() => {
    const clearDpeListener = window.electron.ipcRenderer.on(
      'set-dpe-location',
      setDPEFolder
    );
    const clearCfruListener = window.electron.ipcRenderer.on(
      'set-cfru-location',
      setCFRUFolder
    );
    const clearAssetsListener = window.electron.ipcRenderer.on(
      'set-assets-location',
      setAssetsFolder
    );
    const clearGoogleKeyListener = window.electron.ipcRenderer.on(
      'set-google-key-location',
      setGoogleKeyLocation
    );

    return () => {
      clearDpeListener();
      clearCfruListener();
      clearAssetsListener();
      clearGoogleKeyListener();
    };
  }, [setDPEFolder, setCFRUFolder]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={dialogStyle}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          marginBottom={1}
        >
          Settings
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          flexWrap="wrap"
        >
          <FormControl variant="outlined" sx={folderInputStyle}>
            <TextField
              disabled
              label="DPE Folder"
              value={dpeFolder}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={handleDPESelect}>Select</Button>
          </FormControl>

          <FormControl variant="outlined" sx={folderInputStyle}>
            <TextField
              disabled
              label="CFRU Folder"
              value={cfruFolder}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={handleCFRUSelect}>Select</Button>
          </FormControl>

          <FormControl variant="outlined" sx={folderInputStyle}>
            <TextField
              disabled
              label="Assets Folder"
              value={assetsFolder}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={handleAssetsSelect}>Select</Button>
          </FormControl>

          <FormControl variant="outlined" sx={folderInputStyle}>
            <TextField
              disabled
              label="Google Key File"
              value={googleKeyLocation}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={handleGoogleKeySelect}>Select</Button>
          </FormControl>
        </Box>
      </Box>
    </Modal>
  );
};
