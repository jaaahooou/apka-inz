// src/components/Header.jsx
import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentTheme } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const username = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Użytkownik';
  const userInitial = username.charAt(0).toUpperCase();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');

    navigate('/login');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          py: 1,
          px: 3,
        }}
      >
        {/* Left Side - Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.divider} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            ⚖️
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: '700',
                letterSpacing: '0.5px',
                margin: 0,
              }}
            >
              SĄDY
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
              }}
            >
              System Zarządzania Sprawami
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={handleNotificationOpen}
            sx={{
              color: theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ my: 1, borderColor: theme.palette.divider }}
          />

          {/* User Menu */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              p: 1,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
              },
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '0.95rem',
                  fontWeight: '500',
                }}
              >
                {username}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                }}
              >
                Zalogowany
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
                fontWeight: 'bold',
                color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {userInitial}
            </Avatar>
          </Box>
        </Box>
      </Toolbar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            minWidth: '320px',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography sx={{ color: theme.palette.text.primary, fontWeight: '600' }}>
            Powiadomienia
          </Typography>
        </Box>
        <MenuItem
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)` },
          }}
        >
          <Box sx={{ color: theme.palette.text.primary, fontSize: '0.9rem' }}>
            📅 Rozprava w sprawie CASE-2025-001 za 30 minut
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)` },
          }}
        >
          <Box sx={{ color: theme.palette.text.primary, fontSize: '0.9rem' }}>
            📄 Nowe pismo w sprawie CASE-2025-005
          </Box>
        </MenuItem>
        <MenuItem
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)` },
          }}
        >
          <Box sx={{ color: theme.palette.text.primary, fontSize: '0.9rem' }}>
            💬 Nowa wiadomość w czacie
          </Box>
        </MenuItem>
        <Divider sx={{ borderColor: theme.palette.divider }} />
        <MenuItem
          sx={{
            justifyContent: 'center',
            color: theme.palette.primary.main,
            fontSize: '0.85rem',
            fontWeight: '500',
            '&:hover': { backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)` },
          }}
        >
          Pokaż wszystkie
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            mt: 1,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled sx={{ color: theme.palette.text.secondary, py: 1.5 }}>
          <AccountCircleIcon sx={{ mr: 1.5 }} />
          <Typography sx={{ fontSize: '0.9rem' }}>Mój profil</Typography>
        </MenuItem>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        <MenuItem
          onClick={handleSettings}
          sx={{
            color: theme.palette.text.secondary,
            py: 1,
            '&:hover': {
              backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
              color: theme.palette.text.primary,
            },
          }}
        >
          <SettingsIcon sx={{ mr: 1.5 }} />
          <Typography sx={{ fontSize: '0.9rem' }}>Ustawienia</Typography>
        </MenuItem>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: '#ef5350',
            py: 1,
            '&:hover': {
              backgroundColor: 'rgba(239, 83, 80, 0.1)',
              color: '#ff6b6b',
            },
          }}
        >
          <LogoutIcon sx={{ mr: 1.5 }} />
          <Typography sx={{ fontSize: '0.9rem' }}>Wyloguj się</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
