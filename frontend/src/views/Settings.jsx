import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  TextField,
  Snackbar
} from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';
import useAuth from '../hooks/useAuth';
import API from '../api/axiosConfig';
import useWebSocket from '../hooks/useWebSocket'; // Potrzebny do wysłania sygnału visibility_change
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const Settings = () => {
  const { currentTheme, changeTheme, themes } = useContext(ThemeContext);
  const { user } = useAuth(); // user zawiera dane z tokena, w tym user_id

  // WebSocket do wysyłania zmian statusu na żywo
  const { send } = useWebSocket('ws://127.0.0.1:8000/ws/notifications/');

  // --- STAN DANYCH ---
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // --- STAN UI ---
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [themeSavedMessage, setThemeSavedMessage] = useState(false);

  // --- STAN USTAWIEŃ (Dźwięki, Status) ---
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('notificationSound') !== 'false';
  });

  // Stan dla widoczności online (z bazy danych)
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true); 

  // --- HANDLER PRZEŁĄCZNIKA DŹWIĘKU ---
  const handleSoundToggle = (event) => {
    const isEnabled = event.target.checked;
    setSoundEnabled(isEnabled);
    localStorage.setItem('notificationSound', isEnabled);
    
    if (isEnabled) {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Błąd odtwarzania testowego', e));
    }
  };

  // --- HANDLER PRZEŁĄCZNIKA WIDOCZNOŚCI ---
  const handleVisibilityToggle = async (event) => {
    const isVisible = event.target.checked;
    setOnlineStatusVisible(isVisible);
    const userId = user?.user_id || user?.id;

    if (!userId) return;

    try {
        // 1. Zapisz w bazie danych
        await API.patch(`/court/users/${userId}/update/`, { is_visible: isVisible });
        
        // 2. Wyślij sygnał przez WebSocket, aby inni widzieli zmianę natychmiast
        if (send) {
            send({
                type: 'visibility_change',
                status: isVisible ? 'online' : 'offline'
            });
        }
        
        // Aktualizuj lokalny storage dla Header.jsx (opcjonalnie)
        localStorage.setItem('is_visible', isVisible);

    } catch (err) {
        console.error("Błąd zmiany statusu widoczności:", err);
        setErrorMsg("Nie udało się zmienić statusu widoczności.");
        setOnlineStatusVisible(!isVisible); // Cofnij zmianę w UI
    }
  };

  // --- POBIERANIE DANYCH UŻYTKOWNIKA ---
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = user?.user_id || user?.id;
      if (!userId) return;

      try {
        const response = await API.get(`/court/users/${userId}/`);
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        });
        // Ustawienie przełącznika na podstawie danych z bazy
        if (response.data.is_visible !== undefined) {
            setOnlineStatusVisible(response.data.is_visible);
            localStorage.setItem('is_visible', response.data.is_visible);
        }
      } catch (err) {
        console.error("Błąd pobierania profilu:", err);
        setErrorMsg("Nie udało się pobrać danych profilu.");
      }
    };

    if (user) {
        fetchUserData();
    }
  }, [user]);

  // --- HANDLERY ---
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setThemeSavedMessage(true);
    setTimeout(() => setThemeSavedMessage(false), 3000);
  };

  // --- ZAPIS PROFILU ---
  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const userId = user?.user_id || user?.id;

    if (!userId) {
        setErrorMsg("Błąd identyfikacji użytkownika.");
        setLoading(false);
        return;
    }

    try {
      await API.patch(`/court/users/${userId}/update/`, profileData);
      setSuccessMsg('Dane profilu zostały zaktualizowane.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Wystąpił błąd podczas aktualizacji profilu.');
    } finally {
      setLoading(false);
    }
  };

  // --- ZMIANA HASŁA ---
  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMsg('Nowe hasła nie są identyczne.');
      return;
    }
    if (!passwordData.old_password || !passwordData.new_password) {
        setErrorMsg('Wypełnij wszystkie pola hasła.');
        return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await API.post('/court/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });
      setSuccessMsg('Hasło zostało zmienione pomyślnie.');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.old_password?.[0] || 
                           err.response?.data?.new_password?.[0] || 
                           'Nie udało się zmienić hasła. Sprawdź poprawność danych.';
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  // --- DEFINICJE WIZUALNE ---
  const themeColors = {
    dark: '#1e1e1e',
    navy: '#1a2332',
    burgundy: '#2d1a1a',
    light: '#ffffff',
  };

  const themeAccents = {
    dark: '#e0e0e0',
    navy: '#2c5aa0',
    burgundy: '#c94949',
    light: '#1976d2',
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
          Ustawienia
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Dostosuj wygląd, zarządzaj profilem i dbaj o bezpieczeństwo konta.
        </Typography>
      </Box>

      {/* Global Snackbars */}
      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg('')}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ width: '100%' }}>{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg('')}>
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ width: '100%' }}>{errorMsg}</Alert>
      </Snackbar>

      {/* Alert lokalny dla motywu */}
      {themeSavedMessage && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 4 }}>
          Motyw zmieniony pomyślnie!
        </Alert>
      )}

      {/* --- SEKCJA 1: MOTYW --- */}
      <Paper sx={{ p: 4, mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaletteIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: '600' }}>
            Motyw Kolorystyczny
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Wybierz schemat kolorów, który najlepiej pasuje do Twojego stylu pracy.
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(themes).map(([key, theme]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Card
                onClick={() => handleThemeChange(key)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: currentTheme === key ? `3px solid ${themeAccents[key]}` : '2px solid transparent',
                  transform: currentTheme === key ? 'scale(1.03)' : 'scale(1)',
                  borderRadius: 2,
                  height: '100%',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
                  <Box
                    sx={{
                      mb: 2,
                      height: '80px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${themeColors[key]} 0%, ${themeAccents[key]} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      width: '100%'
                    }}
                  >
                    {currentTheme === key && (
                      <Box
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          backgroundColor: themeAccents[key], borderRadius: '50%',
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '14px',
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 0.5 }}>
                        {theme.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                        {key === 'dark' && 'Standardowy ciemny motyw'}
                        {key === 'navy' && 'Elegancki motyw granatowy'}
                        {key === 'burgundy' && 'Ciepły motyw bordowy'}
                        {key === 'light' && 'Jasny i przejrzysty motyw'}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* --- SEKCJA 2: PROFIL --- */}
      <Paper sx={{ p: 4, mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: '600' }}>
            Twój Profil
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Imię" name="first_name" variant="outlined"
              value={profileData.first_name} onChange={handleProfileChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Nazwisko" name="last_name" variant="outlined"
              value={profileData.last_name} onChange={handleProfileChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Adres e-mail" name="email" type="email" variant="outlined"
              value={profileData.email} onChange={handleProfileChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Numer telefonu" name="phone" variant="outlined"
              value={profileData.phone} onChange={handleProfileChange}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
                variant="contained" 
                size="large"
                onClick={handleSaveProfile} 
                disabled={loading}
                sx={{ minWidth: '200px', borderRadius: 2 }}
            >
              Zapisz zmiany
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- SEKCJA 3: HASŁO --- */}
      <Paper sx={{ p: 4, mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: '600' }}>
            Bezpieczeństwo
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Obecne hasło" name="old_password" type="password" variant="outlined"
              value={passwordData.old_password} onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Nowe hasło" name="new_password" type="password" variant="outlined"
              value={passwordData.new_password} onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Potwierdź nowe hasło" name="confirm_password" type="password" variant="outlined"
              value={passwordData.confirm_password} onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
                variant="outlined" 
                color="error" 
                size="large"
                onClick={handleChangePassword} 
                disabled={loading}
                sx={{ minWidth: '200px', borderRadius: 2 }}
            >
              Zmień hasło
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- SEKCJA 4: INNE --- */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsSuggestIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: '600' }}>
            Inne
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={soundEnabled}
                            onChange={handleSoundToggle}
                            color="primary"
                        />
                    }
                    label="Dźwięki powiadomień"
                    sx={{ display: 'block', mb: 1 }}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={onlineStatusVisible}
                            onChange={handleVisibilityToggle}
                        />
                    }
                    label="Status online widoczny dla innych"
                    sx={{ display: 'block', mb: 1 }}
                />
            </Grid>
        </Grid>
      </Paper>

    </Box>
  );
};

export default Settings;