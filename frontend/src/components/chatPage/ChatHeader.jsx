import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle'; // Importujemy ikonę kropki
import { useTheme } from '@mui/material/styles';

const ChatHeader = ({ selectedUser }) => {
  const theme = useTheme();

  // Zabezpieczenie, gdyby selectedUser nie był jeszcze załadowany
  if (!selectedUser) return null;

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        
        {/* Kontener na Avatar i Kropkę statusu */}
        <Box sx={{ position: 'relative', mr: 2 }}>
            <Avatar
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                width: 40,
                height: 40,
                fontWeight: '600',
              }}
            >
              {selectedUser?.username?.[0]?.toUpperCase()}
            </Avatar>

            {/* Dynamiczna kropka statusu */}
            <CircleIcon
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    fontSize: '14px',
                    // Jeśli is_online = true -> zielony, w przeciwnym razie -> szary
                    color: selectedUser.is_online ? '#44b700' : theme.palette.text.disabled,
                    stroke: theme.palette.background.paper,
                    strokeWidth: 2,
                    borderRadius: '50%'
                }}
            />
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: '600',
              color: theme.palette.text.primary,
              lineHeight: 1.2
            }}
          >
            {selectedUser?.username}
          </Typography>
          
          {/* Dynamiczny tekst statusu */}
          <Typography
            variant="caption"
            sx={{ 
                color: selectedUser.is_online ? theme.palette.success.main : theme.palette.text.secondary 
            }}
          >
            {selectedUser.is_online ? 'Dostępny' : 'Niedostępny'}
          </Typography>
        </Box>
      </Box>

      <IconButton sx={{ color: theme.palette.text.secondary }}>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

export default ChatHeader;