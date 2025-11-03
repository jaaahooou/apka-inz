// src/views/Settings.jsx
import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Settings = () => {
  const { currentTheme, changeTheme, themes } = useContext(ThemeContext);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

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
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
          Ustawienia
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Dostosuj wygląd i zachowanie aplikacji
        </Typography>
      </Box>

      {/* Success Message */}
      {savedMessage && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 3 }}
        >
          Motyw zmieniony pomyślnie!
        </Alert>
      )}

      {/* Theme Selection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaletteIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: '600' }}>
            Motyw Kolorystyczny
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
          Wybierz schemat kolorów, który najlepiej ci się podoba
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(themes).map(([key, theme]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Card
                onClick={() => handleThemeChange(key)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border:
                    currentTheme === key
                      ? `3px solid ${themeAccents[key]}`
                      : '2px solid transparent',
                  transform: currentTheme === key ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea sx={{ p: 2 }}>
                  <Box
                    sx={{
                      mb: 2,
                      height: '100px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${themeColors[key]} 0%, ${themeAccents[key]} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {currentTheme === key && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: themeAccents[key],
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: '600', mb: 0.5 }}>
                    {theme.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {key === 'dark' && 'Standardowy ciemny motyw'}
                    {key === 'navy' && 'Elegancki motyw granatowy'}
                    {key === 'burgundy' && 'Ciepły motyw bordowy'}
                    {key === 'light' && 'Jasny i przejrzysty'}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Display Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
          Wyświetlanie
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Powiadomienia na pulpicie"
          sx={{ display: 'block', mb: 1.5 }}
        />

        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Dźwięki powiadomień"
          sx={{ display: 'block', mb: 1.5 }}
        />

        <FormControlLabel
          control={<Switch />}
          label="Kompaktowy widok tabel"
          sx={{ display: 'block' }}
        />
      </Paper>

      {/* Privacy Settings */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
          Prywatność i Bezpieczeństwo
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Status online widoczny dla innych użytkowników"
          sx={{ display: 'block', mb: 1.5 }}
        />

        <FormControlLabel
          control={<Switch />}
          label="Umożliwić inne osobom kontakt przez czat"
          sx={{ display: 'block', mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Button variant="outlined" color="error">
          Zmień hasło
        </Button>
      </Paper>
    </Box>
  );
};

export default Settings;
