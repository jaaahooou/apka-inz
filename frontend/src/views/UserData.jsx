import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Avatar, 
  Grid, Divider, Chip, CircularProgress, Alert, Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoginIcon from '@mui/icons-material/Login';
import BadgeIcon from '@mui/icons-material/Badge';
import API from '../api/axiosConfig.js';
import useAuth from '../hooks/useAuth';

const UserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchUserData = async () => {
    try {
      // Użyj nowego endpointu
      const response = await API.get('/court/auth/profile/');
      console.log('Dane z API:', response.data);
      setUserData(response.data);
      setError(null);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
      setError('Nie udało się pobrać danych użytkownika.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    fetchUserData();
  }
}, [user]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <PersonIcon color="primary" sx={{ fontSize: 35 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Twoje dane
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Informacje o Twoim koncie
          </Typography>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3 
              }}
            >
              {userData?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {userData?.first_name && userData?.last_name 
                  ? `${userData.first_name} ${userData.last_name}`
                  : userData?.username}
              </Typography>
              <Chip 
                label={user?.role || 'Użytkownik'}
                color="primary" 
                size="small" 
                sx={{ mt: 1 }} 
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nazwa użytkownika
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {userData?.username}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {userData?.email || 'Nie podano'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rola
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user?.role || userData?.role || 'Brak roli'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Numer telefonu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {userData?.phone || 'Nie podano'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data dołączenia
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {userData?.date_joined 
                      ? new Date(userData.date_joined).toLocaleDateString('pl-PL')
                      : 'Brak danych'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default UserData;
