import React from 'react';
import { Box, Button, TextField, Typography, Paper, Avatar, FormControlLabel, Checkbox } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "@fontsource/montserrat/400.css";

const response = await fetch('http://127.0.0.1:8000/api/tasks/');
const data = await response.json();
console.log(data);

const Login = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
    <Paper elevation={9} sx={{
      p: 3,
      width: 500,
      maxWidth: 500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.paper',
      borderRadius: 4,
    }}>

      <Avatar alt="Logo" src="/images/logoApp.png" sx={{ width: 180, height: 180 }} />

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
        sx={{
          bgcolor: '#FFFFFF',
          color: 'black',
          fontWeight: 'bold',
          py: 1,
          px: 2,
          borderRadius: '9999px',
          '&:hover': {
            bgcolor: '#E6D5D5',
          },
          cursor: 'pointer',
          border: 'none',
        }}
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
