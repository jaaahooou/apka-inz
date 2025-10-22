import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Avatar, FormControlLabel, Checkbox } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "@fontsource/montserrat/400.css";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // hook do przekierowania

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: username,
        password: password,
      });

      const access_token = response.data.access;

      if (rememberMe) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('username', username); 
        console.log(username)
      } else {
        sessionStorage.setItem('access_token', access_token);
         sessionStorage.setItem('username', username);
      }

      axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;

      // Przekierowanie po udanym logowaniu
      navigate('/dashboard');
    } catch (err) {
      setError('Niepoprawny login lub hasło');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
      <Paper component="form" onSubmit={handleSubmit} elevation={9} sx={{
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
          label="Login"
          type="text"
          autoComplete="username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          label="Hasło"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormControlLabel 
          control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} 
          label="Zapamiętaj mnie" 
        />
        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
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
};

export default Login;
