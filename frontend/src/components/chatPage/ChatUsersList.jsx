// src/components/chat/ChatUsersList.jsx
import React from 'react';
import {
  Paper,
  TextField,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  Box,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatUsersList = ({
  users,
  loading,
  error,
  searchText,
  onSearchChange,
  selectedUserId,
  onSelectUser,
}) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        width: '30%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* NAGŁÓWEK PANELU */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            mb: 2,
            color: theme.palette.text.primary,
          }}
        >
          💬 Wiadomości
        </Typography>

        {/* Pole wyszukiwania */}
        <TextField
          fullWidth
          size="small"
          placeholder="Szukaj użytkownika..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.palette.text.primary,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.primary.main },
            },
          }}
        />
      </Box>

      {/* LISTA UŻYTKOWNIKÓW */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '3px',
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              minHeight: '200px',
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : users.length > 0 ? (
          users.map((u, index) => (
            <React.Fragment key={u.id}>
              <ListItemButton
                selected={selectedUserId === u.id}
                onClick={() => onSelectUser(u)}
                sx={{
                  borderLeft:
                    selectedUserId === u.id
                      ? `4px solid ${theme.palette.primary.main}`
                      : 'none',
                  backgroundColor:
                    selectedUserId === u.id
                      ? theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(224, 224, 224, 0.08)'
                      : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'rgba(255, 255, 255, 0.04)',
                  },
                  pl: selectedUserId === u.id ? 1.5 : 2,
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        // Jeśli u.is_online istnieje i jest true = zielony
                        // Jeśli u.is_online false lub undefined = szary
                        backgroundColor: u.is_online ? '#44b700' : theme.palette.text.disabled,
                        color: u.is_online ? '#44b700' : theme.palette.text.disabled,
                        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: '600',
                      }}
                    >
                      {u.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: '600',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {u.username}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {u.is_online ? 'Dostępny' : 'Niedostępny'}
                    </Typography>
                  }
                />
              </ListItemButton>
              {index < users.length - 1 && (
                <Divider sx={{ borderColor: theme.palette.divider }} />
              )}
            </React.Fragment>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              Brak użytkowników
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default ChatUsersList;