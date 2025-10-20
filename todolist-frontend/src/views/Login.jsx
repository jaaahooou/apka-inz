import React from 'react';
import { Box, Button, TextField, Typography, Paper, Avatar, FormControlLabel, Checkbox } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
    <Paper elevation={8} sx={{
      p: 4,
      maxWidth: 340,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.paper',
      borderRadius: 4,
    }}>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Logowanie
      </Typography>
      <TextField
        margin="normal"
        fullWidth
        label="Email"
        type="email"
        autoComplete="email"
        variant="outlined"
      />
      <TextField
        margin="normal"
        fullWidth
        label="Hasło"
        type="password"
        autoComplete="current-password"
        variant="outlined"
      />
      <FormControlLabel control={<Checkbox />} label="Zapamiętaj mnie" />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Zaloguj się
      </Button>
      <Button
        fullWidth
        variant="text"
        color="secondary"
        sx={{ mt: 1, mb: 2 }}
      >
        Zapomniałeś hasła?
      </Button>
    </Paper>
  </Box>
);

export default Login;