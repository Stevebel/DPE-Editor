import { Box, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react';

export interface PokedexTabProps {
  onNameChange?: (name: string) => void;
  onSpeciesChange?: (species: string) => void;
}

export const PokedexTab = ({
  onSpeciesChange,
  onNameChange,
}: PokedexTabProps) => {
  const [name, setName] = React.useState('');
  const [species, setSpecies] = React.useState('');
  const [speciesDirty, setSpeciesDirty] = React.useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!speciesDirty) {
      const newSpecies = newName.toUpperCase().replace('\\W+)', '_');
      setSpecies(newSpecies);
      if (onSpeciesChange) {
        onSpeciesChange(newSpecies);
      }
    }
    if (onNameChange) {
      onNameChange(newName);
    }
  };
  const handleSpeciesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpecies = e.target.value;
    setSpecies(newSpecies);
    setSpeciesDirty(newSpecies.length > 0);
    if (onSpeciesChange) {
      onSpeciesChange(newSpecies);
    }
  };

  return (
    <Box id="pokedex">
      <TextField
        label="Pokémon Name"
        variant="standard"
        required
        value={name}
        onChange={handleNameChange}
      />
      <TextField
        label="Species"
        variant="standard"
        required
        value={species}
        onChange={handleSpeciesChange}
      />
    </Box>
  );
};
