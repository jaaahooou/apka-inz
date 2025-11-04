// src/components/chat/ChatEmpty.jsx
import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ChatEmpty = () => {
  const theme = useTheme();

  return (
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
          variant="h5"
          sx={{
            color: theme.palette.text.secondary,
            mb: 1,
            fontWeight: '600',
          }}
        >
          💬 Brak wybranej konwersacji
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          Wybierz użytkownika z listy, aby rozpocząć czat
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatEmpty;
