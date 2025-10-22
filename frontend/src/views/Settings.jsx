import React from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

const Settings = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>
      Ustawienia
    </Typography>
    <FormControlLabel
      control={<Switch defaultChecked />}
      label="Tryb ciemny"
    />
    <FormControlLabel
      control={<Switch />}
      label="Powiadomienia"
    />
  </Box>
);

export default Settings;