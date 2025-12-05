import React, { useState, useRef } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Description as FileIcon
} from '@mui/icons-material';

const ChatInput = ({ onSendMessage }) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  // Zmiana: attachment (single) -> attachments (array)
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Sprawdzenie limitu plików (maks 3)
    if (attachments.length + files.length > 3) {
      setError('Możesz wysłać maksymalnie 3 pliki w jednej wiadomości.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // ✅ ZABEZPIECZENIE: Blokada plików .exe dla każdego pliku
    const hasExe = files.some(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.exe') || 
             file.type === 'application/x-msdownload' || 
             file.type === 'application/exe';
    });

    if (hasExe) {
      setError('Przesyłanie plików wykonywalnych (.exe) jest zabronione ze względów bezpieczeństwa.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachments(prev => [...prev, ...files]);
    setError(null);
    
    // Reset inputa, aby można było wybrać te same pliki ponownie w razie potrzeby
    // lub dodać kolejne w osobnej interakcji
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || error) return;

    // Ponowna walidacja przed wysłaniem
    const hasExe = attachments.some(file => file.name.toLowerCase().endsWith('.exe'));
    if (hasExe) {
        setError('Nie można wysłać pliku .exe.');
        setAttachments([]);
        return;
    }
    
    // Przekazujemy tablicę attachments zamiast pojedynczego pliku
    onSendMessage(message, attachments);
    
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Sekcja podglądu załączników - renderowanie listy */}
        {attachments.length > 0 && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: theme.palette.action.hover,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {attachments.map((file, index) => (
              <Box
                key={`${file.name}-${index}`}
                sx={{
                  p: 1,
                  pl: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: index < attachments.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                }}
              >
                <FileIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500, noWrap: true }}>
                  {file.name}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveAttachment(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Sekcja wprowadzania tekstu i przycisków */}
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', p: 1 }}>
          <input
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
            multiple // Pozwól na wybór wielu plików
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={attachments.length >= 3} // Zablokuj input, jeśli limit osiągnięty
          />
          <label htmlFor="icon-button-file">
            <IconButton 
              color="primary" 
              aria-label="upload file" 
              component="span"
              disabled={attachments.length >= 3}
            >
              <AttachFileIcon />
            </IconButton>
          </label>

          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Napisz wiadomość..."
            inputProps={{ 'aria-label': 'napisz wiadomość' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
          />

          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

          <IconButton
            color="primary"
            sx={{ p: '10px' }}
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0)}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Komunikat błędu */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatInput;