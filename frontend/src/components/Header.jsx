import React, { useState, useContext, useEffect } from 'react';
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
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Info as InfoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useNotifications from '../hooks/useNotifications';
import useAuth from '../hooks/useAuth';
import API from '../api/axiosConfig'; // Dodane do pobrania statusu

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
  
  const { user: authUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Ograniczenie do 5 ostatnich powiadomień
  const displayedNotifications = notifications.slice(0, 5);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  // Stan widoczności użytkownika
  const [isVisible, setIsVisible] = useState(true);

  const username = authUser?.username || localStorage.getItem('username') || 'Użytkownik';
  const userId = authUser?.user_id;
  const userInitial = username.charAt(0).toUpperCase();

  // Pobierz status widoczności przy montowaniu
  useEffect(() => {
      const storedVisibility = localStorage.getItem('is_visible');
      if (storedVisibility !== null) {
          setIsVisible(storedVisibility === 'true');
      } else if (userId) {
          // Fallback do API jeśli brak w localStorage
          API.get(`/court/users/${userId}/`)
             .then(res => {
                 setIsVisible(res.data.is_visible);
                 localStorage.setItem('is_visible', res.data.is_visible);
             })
             .catch(err => console.error("Header visibility fetch error", err));
      }
      
      // Listener na zmiany w localStorage (gdy zmienimy w Settings)
      const handleStorageChange = () => {
          const updated = localStorage.getItem('is_visible');
          if (updated !== null) setIsVisible(updated === 'true');
      };
      
      window.addEventListener('storage', handleStorageChange);
      // Custom event dla zmian w obrębie tej samej karty
      window.addEventListener('local-storage-update', handleStorageChange);
      
      return () => {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('local-storage-update', handleStorageChange);
      };
  }, [userId]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = (notif) => {
      if (!notif.is_read) {
          markAsRead(notif.id);
      }
      if (notif.type === 'hearing_reminder' || notif.type === 'document_added') {
           // Opcjonalna nawigacja
      }
  };

  const handleDeleteClick = (e, id) => {
      e.stopPropagation(); 
      deleteNotification(id);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
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
              <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.95rem', fontWeight: '500' }}>
                  {username}
              </Typography>
              <Typography variant="caption" sx={{ color: isVisible ? theme.palette.success.main : theme.palette.text.secondary }}>
                  {isVisible ? 'Zalogowany' : 'Niewidoczny'}
              </Typography>
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
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, width: '350px', maxHeight: '600px' } }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: '600', color: theme.palette.text.primary }}>Powiadomienia</Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} nowych` : 'Brak nowych'}
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
                <MenuItem disabled>Brak nowych powiadomień</MenuItem>
            ) : (
                displayedNotifications.map((notif) => (
                    <ListItemButton 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        sx={{ 
                            backgroundColor: notif.is_read ? 'transparent' : `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.08)`,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            pr: 1 
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
                            <ListItemIcon sx={{ minWidth: '40px', mt: 0.5 }}>
                                {getNotificationIcon(notif.type)}
                            </ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Typography variant="subtitle2" component="span" sx={{ color: theme.palette.text.primary, fontWeight: notif.is_read ? 400 : 600 }}>
                                        {notif.title}
                                    </Typography>
                                }
                                secondary={
                                    <React.Fragment>
                                        <Typography variant="body2" component="span" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                                            {notif.message}
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: theme.palette.text.disabled }}>
                                            {new Date(notif.sent_at).toLocaleString()}
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                        </Box>
                        
                        <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteClick(e, notif.id)}
                            sx={{ 
                                color: theme.palette.text.disabled, 
                                '&:hover': { color: theme.palette.error.main, backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                                ml: 1,
                                mt: 0.5
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                ))
            )}
        </List>

        {unreadCount > 0 && (
            <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button 
                    fullWidth 
                    variant="text" 
                    size="small" 
                    onClick={markAllAsRead}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Oznacz wszystkie jako przeczytane
                </Button>
            </Box>
        )}
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