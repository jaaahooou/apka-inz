// src/components/chat/ChatInput.jsx
import React from 'react';
import {
  Paper,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatInput = ({
  messageText,
  onMessageChange,
  onSendMessage,
  loading,
}) => {
  const theme = useTheme();

  // ✅ Funkcja do obsługi naciśnięcia klawisza
  const handleKeyPress = (e) => {
    // Wyślij wiadomość po naciśnięciu Enter, jeśli Shift nie jest wciśnięty
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Zapobiega dodaniu nowej linii w polu tekstowym
      if (messageText.trim()) { // Wyślij tylko, jeśli wiadomość nie jest pusta
        onSendMessage();
      }
    }
  };

  return (
    <Paper
      component="form" // Użycie form dla lepszej semantyki
      onSubmit={(e) => {
        e.preventDefault();
        if (messageText.trim()) {
          onSendMessage();
        }
      }}
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        gap: 1,
        alignItems: 'center', // Lepsze wyrównanie
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        minRows={1}
        placeholder="Wpisz wiadomość..."
        value={messageText}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyPress} // ✅ Zmieniono z onKeyPress na onKeyDown dla lepszej responsywności
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: theme.palette.primary.main },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.7,
          },
        }}
      />
      <IconButton color="primary" disabled={loading}>
        <AttachFileIcon />
      </IconButton>
      <IconButton
        type="submit" // Umożliwia wysłanie formularza
        color="primary"
        disabled={!messageText.trim() || loading}
      >
        {loading ? <CircularProgress size={24} /> : <SendIcon />}
      </IconButton>
    </Paper>
  );
};

export default ChatInput;
