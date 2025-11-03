import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Gość';

  const handleLogout = () => {
    // Usuń token i username z localStorage i sessionStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('username');

    // Przekieruj na stronę logowania
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Witaj, {username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Wyloguj się
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;