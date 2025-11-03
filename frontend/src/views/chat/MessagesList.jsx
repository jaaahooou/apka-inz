// src/pages/Chat/MessagesList.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import chatAPI from '../../api/chatAPI';

const MessagesList = ({ roomId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      // Polling co 2 sekundy
      pollIntervalRef.current = setInterval(fetchMessages, 2000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const response = await chatAPI.getRoomMessages(roomId);
      setMessages(response.data);
      
      // Oznacz nieprzeczytane wiadomości jako przeczytane
      response.data.forEach(msg => {
        if (!msg.is_read && msg.sender !== currentUserId) {
          chatAPI.markAsRead(msg.id).catch(console.error);
        }
      });
    } catch (err) {
      console.error('Błąd przy pobieraniu wiadomości:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const response = await chatAPI.sendMessage(roomId, newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
      setError('');
    } catch (err) {
      setError('Nie udało się wysłać wiadomości');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async () => {
    if (!editText.trim()) return;

    try {
      const response = await chatAPI.editMessage(editingId, editText);
      setMessages(messages.map(msg => msg.id === editingId ? response.data : msg));
      setEditingId(null);
      setEditText('');
      setAnchorEl(null);
    } catch (err) {
      setError('Nie udało się edytować wiadomości');
      console.error(err);
    }
  };

  const handleDeleteMessage = async () => {
    try {
      await chatAPI.deleteMessage(selectedMessageId);
      setMessages(messages.filter(msg => msg.id !== selectedMessageId));
      setAnchorEl(null);
    } catch (err) {
      setError('Nie udało się usunąć wiadomości');
      console.error(err);
    }
  };

  const openMenu = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  if (!roomId) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">Wybierz pokój, aby rozpocząć czat</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="textSecondary">Brak wiadomości</Typography>
          </Box>
        ) : (
          messages.map(message => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === currentUserId ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  backgroundColor: message.sender === currentUserId ? '#1976d2' : '#e0e0e0',
                  color: message.sender === currentUserId ? 'white' : 'black',
                  borderRadius: 2,
                  p: 1.5,
                  wordWrap: 'break-word',
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  {editingId === message.id ? (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <TextField
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" onClick={handleEditMessage}>OK</Button>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2">{message.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                        {new Date(message.created_at).toLocaleTimeString('pl-PL')}
                      </Typography>
                    </>
                  )}
                </Box>
                {message.sender === currentUserId && (
                  <IconButton
                    size="small"
                    onClick={(e) => openMenu(e, message.id)}
                    sx={{ color: 'inherit' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Napisz wiadomość..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            multiline
            maxRows={4}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            const msg = messages.find(m => m.id === selectedMessageId);
            setEditingId(selectedMessageId);
            setEditText(msg.content);
            closeMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edytuj
        </MenuItem>
        <MenuItem onClick={handleDeleteMessage}>
          <DeleteIcon sx={{ mr: 1 }} />
          Usuń
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MessagesList;
