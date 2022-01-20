import {
  Box,
  Button,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}
const Config = window.electron.store;

const dialogStyle = {
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
const folderInputStyle = {
  flexDirection: 'row',
  flexGrow: 1,
  mt: 1,
  flexBasis: 550,
};

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const [dpeFolder, setDPEFolder] = React.useState(Config.get('dpeFolder'));
  const [cfruFolder, setCFRUFolder] = React.useState(Config.get('cfruFolder'));

  const handleDPESelect = () => {
    window.electron.ipcRenderer.send('locate-dpe');
  };
  const handleCFRUSelect = () => {
    window.electron.ipcRenderer.send('locate-cfru');
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
    return () => {
      clearDpeListener();
      clearCfruListener();
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
          marginBottom={2}
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
        </Box>
      </Box>
    </Modal>
  );
};
