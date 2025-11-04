// src/components/chat/ChatMessages.jsx
import React, { useRef, useEffect } from 'react';
import {
  Box,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChatMessage from './ChatMessage';

// Funkcja do formatowania daty
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Dzisiaj';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Wczoraj';
  } else {
    return date.toLocaleDateString('pl-PL');
  }
};

const ChatMessages = ({
  messages,
  loading,
  error,
  currentUserId,
  selectedUser,
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  // Scroll do ostatniej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Grupuj wiadomości po dacie
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      ) : Object.keys(groupedMessages).length > 0 ? (
        Object.entries(groupedMessages).map(([date, msgs]) => (
          <Box key={date}>
            {/* Separator daty */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Divider sx={{ flex: 1, borderColor: theme.palette.divider }} />
              <Chip
                label={date}
                size="small"
                sx={{
                  backgroundColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              />
              <Divider sx={{ flex: 1, borderColor: theme.palette.divider }} />
            </Box>

            {/* Wiadomości */}
            {msgs.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                selectedUser={selectedUser}
              />
            ))}
          </Box>
        ))
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.secondary, mb: 1 }}
            >
              Brak wiadomości
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              Zacznij konwersację z {selectedUser?.username}
            </Typography>
          </Box>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessages;
