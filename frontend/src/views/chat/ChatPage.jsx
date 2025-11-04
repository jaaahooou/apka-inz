// src/views/ChatView.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  Chip,
  useTheme,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import API from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import useUsers from '../../hooks/useUsers';

// Funkcja do formatowania czasu
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

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

const ChatView = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Pobierz wiadomości gdy zmieni się wybrany użytkownik
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Scroll do ostatniej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (userId) => {
    try {
      setMessagesLoading(true);
      setError(null);
      const response = await API.get(`/court/messages/?recipient_id=${userId}`);
      setMessages(response.data);
    } catch (err) {
      setError('Błąd przy pobieraniu wiadomości');
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    try {
      setSendingMessage(true);
      setError(null);
      const response = await API.post('/court/messages/', {
        recipient_id: selectedUser.id,
        content: messageText,
      });

      setMessages([...messages, response.data]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Błąd przy wysyłaniu wiadomości');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtruj użytkowników - usuń bieżącego użytkownika
  const filteredUsers = users
    .filter(u => u.id !== user?.id)
    .filter(u =>
      (u.username || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchText.toLowerCase())
    );

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
        display: 'flex',
        height: 'calc(100vh - 64px)',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* ========== PANEL LEWY - LISTA UŻYTKOWNIKÓW ========== */}
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
            onChange={(e) => setSearchText(e.target.value)}
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
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: '200px' }}>
              <CircularProgress size={30} />
            </Box>
          ) : usersError ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{usersError}</Alert>
            </Box>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u, index) => (
              <React.Fragment key={u.id}>
                <ListItemButton
                  selected={selectedUser?.id === u.id}
                  onClick={() => setSelectedUser(u)}
                  sx={{
                    borderLeft:
                      selectedUser?.id === u.id
                        ? `4px solid ${theme.palette.primary.main}`
                        : 'none',
                    backgroundColor:
                      selectedUser?.id === u.id
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
                    pl: selectedUser?.id === u.id ? 1.5 : 2,
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
                          backgroundColor: '#44b700',
                          color: '#44b700',
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
                        {u.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
                {index < filteredUsers.length - 1 && (
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

      {/* ========== PANEL PRAWY - OKNO CHATU ========== */}
      <Box
        sx={{
          width: '70%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {selectedUser ? (
          <>
            {/* NAGŁÓWEK CHATU */}
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    width: 40,
                    height: 40,
                    fontWeight: '600',
                  }}
                >
                  {selectedUser.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: '600',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {selectedUser.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    🟢 Aktywny
                  </Typography>
                </Box>
              </Box>
              <IconButton sx={{ color: theme.palette.text.secondary }}>
                <MoreVertIcon />
              </IconButton>
            </Paper>

            {/* OBSZAR WIADOMOŚCI */}
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

              {messagesLoading ? (
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
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                          mb: 1.5,
                          alignItems: 'flex-end',
                          gap: 1,
                        }}
                      >
                        {msg.sender_id !== user?.id && (
                          <Avatar
                            sx={{
                              backgroundColor: theme.palette.secondary.main,
                              color: '#fff',
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem',
                              fontWeight: '600',
                            }}
                          >
                            {selectedUser.username?.[0]?.toUpperCase()}
                          </Avatar>
                        )}

                        <Paper
                          sx={{
                            maxWidth: '55%',
                            p: 1.5,
                            backgroundColor:
                              msg.sender_id === user?.id
                                ? theme.palette.primary.main
                                : theme.palette.background.paper,
                            color:
                              msg.sender_id === user?.id
                                ? '#fff'
                                : theme.palette.text.primary,
                            borderRadius: msg.sender_id === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            boxShadow: 'none',
                            border:
                              msg.sender_id === user?.id
                                ? 'none'
                                : `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: 'break-word',
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.content}
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
                            {formatTime(msg.created_at)}
                          </Typography>
                        </Paper>

                        {msg.sender_id === user?.id && (
                          <Avatar
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: '#fff',
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem',
                              fontWeight: '600',
                            }}
                          >
                            {user?.username?.[0]?.toUpperCase()}
                          </Avatar>
                        )}
                      </Box>
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
                      Zacznij konwersację z {selectedUser.username}
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* POLE WPISYWANIA WIADOMOŚCI */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                minRows={1}
                placeholder="Wpisz wiadomość..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendingMessage}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme.palette.text.primary,
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.7,
                  },
                }}
              />
              <IconButton
                color="primary"
                disabled={sendingMessage}
                sx={{
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(224, 224, 224, 0.08)',
                  },
                }}
              >
                <AttachFileIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!messageText.trim() || sendingMessage}
                sx={{
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(224, 224, 224, 0.08)',
                  },
                }}
              >
                {sendingMessage ? (
                  <CircularProgress size={24} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Paper>
          </>
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
                variant="h5"
                sx={{ color: theme.palette.text.secondary, mb: 1, fontWeight: '600' }}
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
        )}
      </Box>
    </Box>
  );
};

export default ChatView;
