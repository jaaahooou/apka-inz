// src/components/chat/ChatMessage.jsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ChatMessage = ({ message, currentUserId, selectedUser }) => {
  const theme = useTheme();
  
  const isOwnMessage = String(message.sender_id) === String(currentUserId);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1.5,
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      <Paper
        sx={{
          maxWidth: '55%',
          p: 1.5,
          backgroundColor: isOwnMessage
            ? theme.palette.background.paper
            : theme.palette.primary.main,
          color: isOwnMessage
            ? theme.palette.text.primary
            : '#fff',
          borderRadius: isOwnMessage 
            ? '18px 4px 18px 18px'
            : '4px 18px 18px 18px',
          boxShadow: 'none',
          border: isOwnMessage
            ? `1px solid ${theme.palette.divider}`
            : 'none',
          position: 'relative',
          overflow: 'hidden', // ✅ DODANE: Ukrywa wewnętrzne trójkąty
          '&::after': isOwnMessage ? {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: 0,
            borderTop: `10px solid ${theme.palette.background.paper}`,
            borderBottom: 0,
            left: '-10px',
            bottom: '0px',
          } : {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: 0,
            borderRight: '10px solid transparent',
            borderTop: `10px solid ${theme.palette.primary.main}`,
            borderBottom: 0,
            right: '-10px',
            bottom: '0px',
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            wordBreak: 'break-word',
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            fontSize: '0.7rem',
          }}
        >
          {formatTime(message.created_at)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
