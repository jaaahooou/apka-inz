import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  IconButton,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useNotifications from '../hooks/useNotifications';

// Helper do ikony powiadomienia
const getNotificationIcon = (type) => {
    switch(type) {
        case 'hearing_reminder': return <GavelIcon color="primary" fontSize="small" />;
        case 'document_added': return <DescriptionIcon color="info" fontSize="small" />;
        default: return <InfoIcon color="action" fontSize="small" />;
    }
};

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentTheme } = useContext(ThemeContext);
  
  // Hook powiadomień
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const username = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Użytkownik';
  const userInitial = username.charAt(0).toUpperCase();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
    // Opcjonalnie: oznaczanie wszystkich jako przeczytane przy zamknięciu?
    // markAllAsRead(); 
  };

  const handleNotificationClick = (notif) => {
      if (!notif.is_read) {
          markAsRead(notif.id);
      }
      // Nawigacja w zależności od typu (opcjonalnie)
      if (notif.type === 'hearing_reminder' || notif.type === 'document_added') {
           // Można dodać case_id do powiadomienia w backendzie, by tu nawigować
           // navigate(`/cases/${notif.case_id}`);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('username');
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: 3 }}>
        
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.divider} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            ⚖️
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: '700', margin: 0 }}>SĄDY</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>System Zarządzania Sprawami</Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Notifications */}
          <IconButton onClick={handleNotificationOpen} sx={{ color: theme.palette.text.secondary }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: theme.palette.divider }} />

          {/* User Profile */}
          <Box onClick={handleMenuOpen} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: '8px' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.95rem', fontWeight: '500' }}>{username}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Zalogowany</Typography>
            </Box>
            <Avatar sx={{ width: 38, height: 38, background: theme.palette.primary.main }}>{userInitial}</Avatar>
          </Box>
        </Box>
      </Toolbar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, width: '350px', maxHeight: '500px' } }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: '600', color: theme.palette.text.primary }}>Powiadomienia</Typography>
          {unreadCount > 0 && (
              <Typography variant="caption" sx={{ cursor: 'pointer', color: theme.palette.primary.main }} onClick={markAllAsRead}>
                  Oznacz wszystkie
              </Typography>
          )}
        </Box>
        
        <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
                <MenuItem disabled>Brak nowych powiadomień</MenuItem>
            ) : (
                notifications.map((notif) => (
                    <ListItem 
                        key={notif.id} 
                        button 
                        onClick={() => handleNotificationClick(notif)}
                        sx={{ 
                            backgroundColor: notif.is_read ? 'transparent' : `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.08)`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: '40px' }}>
                            {getNotificationIcon(notif.type)}
                        </ListItemIcon>
                        <ListItemText 
                            primary={
                                <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: notif.is_read ? 400 : 600 }}>
                                    {notif.title}
                                </Typography>
                            }
                            secondary={
                                <React.Fragment>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                                        {notif.message}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                        {new Date(notif.sent_at).toLocaleString()}
                                    </Typography>
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                ))
            )}
        </List>
      </Menu>

      {/* User Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, mt: 1 } }}>
        <MenuItem disabled sx={{ py: 1.5 }}> <AccountCircleIcon sx={{ mr: 1.5 }} /> Mój profil </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}> <SettingsIcon sx={{ mr: 1.5 }} /> Ustawienia </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: '#ef5350' }}> <LogoutIcon sx={{ mr: 1.5 }} /> Wyloguj się </MenuItem>
      </Menu>

    </AppBar>
  );
};

export default Header;