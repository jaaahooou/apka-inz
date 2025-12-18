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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import '@fontsource/montserrat/400.css';
import useAuth from '../hooks/useAuth';
import axios from '../api/axiosConfig';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  
  const [localError, setLocalError] = useState(null);

  // --- STAN DLA MODALA RESETU HASŁA ---
  const [openReset, setOpenReset] = useState(false);
  const [resetData, setResetData] = useState({
    email: '',
    username: '',
    new_password: '',
    confirm_password: ''
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setLocalError('Nazwa użytkownika i hasło są wymagane');
      return;
    }

    const success = await handleLogin(
      formData.username,
      formData.password,
      formData.rememberMe
    );

    if (success) {
      navigate('/dashboard');
    }
  };

  // --- FUNKCJE RESETU HASŁA ---
  const handleResetChange = (e) => {
    setResetData({
      ...resetData,
      [e.target.name]: e.target.value
    });
    setResetError(null);
  };

  const handleResetSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!resetData.email || !resetData.username || !resetData.new_password || !resetData.confirm_password) {
        setResetError("Wszystkie pola są wymagane.");
        return;
    }
    if (resetData.new_password !== resetData.confirm_password) {
        setResetError("Hasła nie są identyczne.");
        return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
        // ZMIANA: Pełna ścieżka z prefiksem /court/
        const response = await axios.post('/court/auth/reset-password/', {
            email: resetData.email,
            username: resetData.username,
            new_password: resetData.new_password,
            confirm_password: resetData.confirm_password
        });
        
        setResetSuccess(response.data.message);
        setResetData({ email: '', username: '', new_password: '', confirm_password: '' });

    } catch (err) {
        if (err.response && err.response.data) {
            if (err.response.data.error) {
                setResetError(err.response.data.error);
            } 
            else if (typeof err.response.data === 'object') {
                 const firstKey = Object.keys(err.response.data)[0];
                 const msg = err.response.data[firstKey];
                 const msgText = Array.isArray(msg) ? msg[0] : msg;
                 setResetError(`${firstKey}: ${msgText}`);
            } else {
                setResetError("Wystąpił błąd podczas resetowania hasła.");
            }
        } else {
            setResetError("Błąd połączenia z serwerem.");
        }
    } finally {
        setResetLoading(false);
    }
  };

  const handleCloseReset = () => {
    setOpenReset(false);
    setResetError(null);
    setResetSuccess(null);
    setResetData({ email: '', username: '', new_password: '', confirm_password: '' });
  };

  const getTranslatedError = (error) => {
    if (!error) return null;
    const errorString = typeof error === 'string' ? error : JSON.stringify(error);

    if (errorString.includes("ACCOUNT_DISABLED")) {
      return "Twoje konto oczekuje na akceptację Administratora.";
    }
    if (errorString.includes("INVALID_CREDENTIALS") || errorString.includes("No active account")) {
        return "Błędna nazwa użytkownika lub hasło.";
    }
    return "Wystąpił błąd logowania.";
  };

  const displayError = localError || getTranslatedError(authError);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
      <Paper component="form" onSubmit={handleSubmit} elevation={9} sx={{ p: 4, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#2d2d2d', borderRadius: 4, color: '#fff' }}>
        <Avatar alt="Logo" src="/images/logoApp.png" sx={{ width: 150, height: 150, mb: 2, bgcolor: '#404040' }} />
        <Avatar sx={{ m: 1, bgcolor: '#1976d2', width: 56, height: 56 }}> <LockOutlinedIcon sx={{ fontSize: 32 }} /> </Avatar>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#fff', fontFamily: '"Montserrat", sans-serif' }}> Logowanie </Typography>

        {displayError && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {displayError} </Alert> )}

        <TextField margin="normal" fullWidth label="Nazwa użytkownika" name="username" autoComplete="username" variant="outlined" value={formData.username} onChange={handleChange} disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputBase-input::placeholder': { color: '#b0b0b0', opacity: 1 } }} />
        <TextField margin="normal" fullWidth label="Hasło" name="password" type="password" autoComplete="current-password" variant="outlined" value={formData.password} onChange={handleChange} disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputBase-input::placeholder': { color: '#b0b0b0', opacity: 1 } }} />

        <FormControlLabel control={ <Checkbox name="rememberMe" checked={formData.rememberMe} onChange={handleChange} disabled={loading} sx={{ color: '#1976d2' }} /> } label={<Typography sx={{ color: '#b0b0b0' }}>Zapamiętaj mnie</Typography>} sx={{ alignSelf: 'flex-start', mt: 1, mb: 2 }} />

        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: '#FFFFFF', color: '#000', fontWeight: 'bold', py: 1.2, px: 2, borderRadius: '9999px', fontSize: '1rem', '&:hover': { bgcolor: '#E6D5D5' }, '&:disabled': { bgcolor: '#888', color: '#ccc' }, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', gap: 1 }}> {loading ? ( <> <CircularProgress size={20} sx={{ color: '#000' }} /> <span>Logowanie...</span> </> ) : ( 'Zaloguj się' )} </Button>
        <Button fullWidth variant="text" disabled={loading} onClick={() => setOpenReset(true)} sx={{ mt: 2, mb: 2, color: '#b0b0b0', '&:hover': { color: '#fff', bgcolor: 'transparent' } }}> Zapomniałeś hasła? </Button>
        <Button fullWidth variant="text" disabled={loading} onClick={() => navigate('/register')} sx={{ color: '#1976d2', '&:hover': { color: '#42a5f5', bgcolor: 'transparent' } }}> Nie masz konta? Zarejestruj się tutaj! </Button>
      </Paper>

      {/* --- MODAL RESETU HASŁA --- */}
      <Dialog open={openReset} onClose={handleCloseReset} PaperProps={{ sx: { bgcolor: '#2d2d2d', color: '#fff', minWidth: '350px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Zresetuj hasło</DialogTitle>
        <form onSubmit={handleResetSubmit}>
            <DialogContent>
                <DialogContentText sx={{ color: '#b0b0b0', mb: 2 }}> Podaj swój e-mail i login, aby ustawić nowe hasło. </DialogContentText>
                {resetError && ( <Alert severity="error" sx={{ mb: 2 }}> {resetError} </Alert> )}
                {resetSuccess && ( <Alert severity="success" sx={{ mb: 2 }}> {resetSuccess} </Alert> )}
                {!resetSuccess && (
                    <>
                        <TextField margin="dense" label="Adres e-mail" name="email" type="email" fullWidth variant="outlined" value={resetData.email} onChange={handleResetChange} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: '#b0b0b0' } }} />
                        <TextField margin="dense" label="Nazwa użytkownika" name="username" type="text" fullWidth variant="outlined" value={resetData.username} onChange={handleResetChange} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: '#b0b0b0' } }} />
                        <TextField margin="dense" label="Nowe hasło" name="new_password" type="password" fullWidth variant="outlined" value={resetData.new_password} onChange={handleResetChange} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: '#b0b0b0' } }} />
                        <TextField margin="dense" label="Potwierdź nowe hasło" name="confirm_password" type="password" fullWidth variant="outlined" value={resetData.confirm_password} onChange={handleResetChange} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: '#b0b0b0' } }} />
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseReset} sx={{ color: '#b0b0b0' }}> {resetSuccess ? 'Zamknij' : 'Anuluj'} </Button>
                {!resetSuccess && ( <Button type="submit" disabled={resetLoading} variant="contained" sx={{ bgcolor: '#1976d2' }}> {resetLoading ? 'Przetwarzanie...' : 'Zmień hasło'} </Button> )}
            </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
export default Login;