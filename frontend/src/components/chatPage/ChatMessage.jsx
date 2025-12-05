// src/components/chat/ChatMessage.jsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Description as FileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

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
  const attachmentUrl = message.attachment_url;

  // ✅ Poprawiona logika wykrywania obrazka
  // 1. Jeśli mamy jawny typ MIME (np. z optimistic update), użyj go.
  // 2. Jeśli nie, sprawdź rozszerzenie w URLu.
  const isImage = React.useMemo(() => {
    if (!attachmentUrl) return false;

    // Jeśli wiadomość ma pole attachment_type (dodane w ChatPage przy wysyłaniu)
    if (message.attachment_type) {
      return message.attachment_type.startsWith('image/');
    }

    // Fallback: Sprawdź rozszerzenie pliku (dla wiadomości z backendu)
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentUrl);
  }, [attachmentUrl, message.attachment_type]);

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
          overflow: 'hidden',
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
        {/* ✅ Renderowanie załącznika */}
        {attachmentUrl && (
          <Box sx={{ mb: message.content ? 1 : 0 }}>
            {isImage ? (
              // Widok dla obrazka
              <Box
                component="img"
                src={attachmentUrl}
                alt="Załącznik"
                onClick={() => window.open(attachmentUrl, '_blank')}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '250px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'block',
                  border: isOwnMessage ? `1px solid ${theme.palette.divider}` : 'none',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              />
            ) : (
              // Widok dla dokumentu (PDF, TXT, etc.)
              <Link
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'inherit',
                  textDecoration: 'none',
                  backgroundColor: isOwnMessage ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)',
                  p: 1.5,
                  borderRadius: 1,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: isOwnMessage ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <FileIcon fontSize="large" />
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}
                  >
                    {/* Jeśli nie mamy nazwy pliku w URL, wyświetl generyczną */}
                    {attachmentUrl.split('/').pop() || 'Dokument'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Kliknij, aby pobrać
                  </Typography>
                </Box>
              </Link>
            )}
          </Box>
        )}

        {/* Treść tekstowa */}
        {message.content && (
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </Typography>
        )}

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            fontSize: '0.7rem',
            textAlign: 'right',
          }}
        >
          {formatTime(message.created_at)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;