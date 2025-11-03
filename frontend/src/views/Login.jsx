import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import '@fontsource/montserrat/400.css';
import useAuth from '../hooks/useAuth'; // Użyj hooka!

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setLocalError(null); // Wyczyść błąd gdy użytkownik zacznie pisać
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Walidacja
    if (!formData.username.trim() || !formData.password.trim()) {
      setLocalError('Nazwa użytkownika i hasło są wymagane');
      return;
    }

    // Użyj handleLogin z contextu
    const success = await handleLogin(
      formData.username,
      formData.password,
      formData.rememberMe
    );

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={9}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#2d2d2d',
          borderRadius: 4,
          color: '#fff',
        }}
      >
        {/* Logo */}
        <Avatar
          alt="Logo"
          src="/images/logoApp.png"
          sx={{
            width: 150,
            height: 150,
            mb: 2,
            bgcolor: '#404040',
          }}
        />

        {/* Lock Icon */}
        <Avatar
          sx={{
            m: 1,
            bgcolor: '#1976d2',
            width: 56,
            height: 56,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          Logowanie
        </Typography>

        {/* Error Messages */}
        {(authError || localError) && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {authError || localError}
          </Alert>
        )}

        {/* Username Field */}
        <TextField
          margin="normal"
          fullWidth
          label="Nazwa użytkownika"
          name="username"
          type="text"
          autoComplete="username"
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#b0b0b0',
              opacity: 1,
            },
          }}
        />

        {/* Password Field */}
        <TextField
          margin="normal"
          fullWidth
          label="Hasło"
          name="password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#b0b0b0',
              opacity: 1,
            },
          }}
        />

        {/* Remember Me */}
        <FormControlLabel
          control={
            <Checkbox
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
              sx={{ color: '#1976d2' }}
            />
          }
          label={<Typography sx={{ color: '#b0b0b0' }}>Zapamiętaj mnie</Typography>}
          sx={{ alignSelf: 'flex-start', mt: 1, mb: 2 }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#000',
            fontWeight: 'bold',
            py: 1.2,
            px: 2,
            borderRadius: '9999px',
            fontSize: '1rem',
            '&:hover': {
              bgcolor: '#E6D5D5',
            },
            '&:disabled': {
              bgcolor: '#888',
              color: '#ccc',
            },
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: '#000' }} />
              <span>Logowanie...</span>
            </>
          ) : (
            'Zaloguj się'
          )}
        </Button>

        {/* Forgot Password */}
        <Button
          fullWidth
          variant="text"
          disabled={loading}
          sx={{
            mt: 2,
            mb: 2,
            color: '#b0b0b0',
            '&:hover': {
              color: '#fff',
              bgcolor: 'transparent',
            },
          }}
        >
          Zapomniałeś hasła?
        </Button>

        {/* Register Link */}
        <Button
          fullWidth
          variant="text"
          disabled={loading}
          onClick={() => navigate('/register')}
          sx={{
            color: '#1976d2',
            '&:hover': {
              color: '#42a5f5',
              bgcolor: 'transparent',
            },
          }}
        >
          Nie masz konta? Zarejestruj się tutaj!
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
