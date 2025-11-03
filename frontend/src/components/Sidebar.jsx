// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Badge,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ThemeContext } from '../contexts/ThemeContext';

const drawerWidth = 280;

const Sidebar = ({ unreadMessagesCount = 0 }) => {
  const location = useLocation();
  const theme = useTheme();
  const { currentTheme } = useContext(ThemeContext);

  const mainMenuItems = [
    { text: 'Strona Główna', path: '/home', icon: HomeIcon },
    { text: 'Twoje sprawy', path: '/reports', icon: GavelIcon },
    { text: 'Kalendarz', path: '/usercalendar', icon: EventIcon },
    { text: 'Pisma', path: '/userdocs', icon: DescriptionIcon },
    { text: 'Twoje dane', path: '/userdata', icon: PersonIcon },
  ];

  const secondaryMenuItems = [
    { text: 'Wiadomości', path: '/chat', icon: ChatIcon, badge: unreadMessagesCount },
    { text: 'Ustawienia', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const renderMenuItems = (items) => {
    return items.map(({ text, path, icon: IconComponent, badge }) => {
      const active = isActive(path);
      return (
        <ListItem key={text} disablePadding>
          <ListItemButton
            component={Link}
            to={path}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: '8px',
              backgroundColor: active
                ? `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.15)`
                : 'transparent',
              color: active ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.15)`,
                color: theme.palette.primary.main,
                transform: 'translateX(4px)',
              },
              '&::before': active
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '24px',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 4px 4px 0',
                  }
                : {},
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40,
              }}
            >
              {badge ? (
                <Badge
                  badgeContent={badge}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ef5350',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      minWidth: '20px',
                    },
                  }}
                >
                  <IconComponent />
                </Badge>
              ) : (
                <IconComponent />
              )}
            </ListItemIcon>
            <ListItemText
              primary={text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: active ? '600' : '500',
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '64px',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <GavelIcon sx={{ color: theme.palette.primary.main, fontSize: '28px' }} />
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: '700',
              letterSpacing: '1px',
              fontSize: '1.1rem',
            }}
          >
            SĄDY
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ px: 1, pt: 2 }}>
        {/* Main Menu */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              color: theme.palette.text.secondary,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              fontSize: '0.7rem',
            }}
          >
            Menu
          </Typography>
          <Box sx={{ mt: 1 }}>
            {renderMenuItems(mainMenuItems)}
          </Box>
        </Box>

        <Divider
          sx={{
            my: 2,
            borderColor: theme.palette.divider,
          }}
        />

        {/* Secondary Menu */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              color: theme.palette.text.secondary,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              fontSize: '0.7rem',
            }}
          >
            Komunikacja
          </Typography>
          <Box sx={{ mt: 1 }}>
            {renderMenuItems(secondaryMenuItems)}
          </Box>
        </Box>
      </List>

      {/* Footer */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Chip
          icon={<NotificationsIcon />}
          label="Nowości"
          variant="outlined"
          size="small"
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.disabled,
            textAlign: 'center',
            fontSize: '0.75rem',
          }}
        >
          Wersja 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
