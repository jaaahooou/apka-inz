// src/views/ChatView.jsx
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import API from '../api/axiosConfig';
import useUsers from '../hooks/useUsers';
import useWebSocket from '../hooks/useWebSocket';
import ChatUsersList from '../components/chatPage/ChatUsersList';
import ChatHeader from '../components/chatPage/ChatHeader';
import ChatMessages from '../components/chatPage/ChatMessages';
import ChatInput from '../components/chatPage/ChatInput';
import ChatEmpty from '../components/chatPage/ChatEmpty';

const ChatView = () => {
  const theme = useTheme();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserUsername, setCurrentUserUsername] = useState('');

  // Konstrukcja URL dla WebSocket
  // Tworzymy unikalny, posortowany ID pokoju, aby obie strony miały ten sam
  const roomName = currentUserId && selectedUser
    ? [currentUserId, selectedUser.id].sort().join('_')
    : null;
  const wsUrl = roomName ? `ws://localhost:8000/ws/chat/${roomName}/` : null;

  // Hook WebSocket do odbierania wiadomości
  useWebSocket(wsUrl, (data) => {
    if (data.type === 'chat_message' && data.message) {
      // Dodaj wiadomość tylko wtedy, gdy nie jest to nasza własna wiadomość (już dodana optymistycznie)
      // Sprawdzamy po ID, jeśli jest tymczasowe, to wiadomość jest nasza
      setMessages((prevMessages) => {
        if (prevMessages.some(msg => msg.id === data.message.id)) {
          return prevMessages;
        }
        return [...prevMessages, data.message];
      });
    }
  });
  
  // Hook do wysyłania wiadomości
  const { send: sendWS } = useWebSocket(wsUrl, null);

  // Pobieranie ID i nazwy bieżącego użytkownika
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await API.get('/court/auth/me/');
        setCurrentUserId(response.data.id);
        setCurrentUserUsername(response.data.username);
      } catch (err) {
        console.error('Błąd podczas pobierania danych bieżącego użytkownika:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Pobieranie historii wiadomości po wybraniu użytkownika
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async (userId) => {
        try {
          setMessagesLoading(true);
          const response = await API.get(`/court/messages/?recipient_id=${userId}`);
          setMessages(response.data);
        } catch (err) {
          setError('Błąd przy pobieraniu wiadomości');
        } finally {
          setMessagesLoading(false);
        }
      };
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Funkcja do wysyłania wiadomości
  const sendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;

    // Krok 1: Stwórz tymczasowy obiekt wiadomości do natychmiastowego wyświetlenia
    const optimisticMessage = {
      id: `temp-${Date.now()}`, // Tymczasowe ID
      sender: currentUserId,
      sender_id: currentUserId,
      sender_username: currentUserUsername,
      recipient: selectedUser.id,
      recipient_username: selectedUser.username,
      content: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    // Krok 2: Dodaj wiadomość do stanu (Optymistyczna aktualizacja)
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    // Krok 3: Wyślij wiadomość przez WebSocket do serwera
    sendWS({
      type: 'chat_message',
      recipient_id: selectedUser.id,
      content: messageText,
    });

    // Krok 4: Wyczyść pole do wpisywania
    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = users.filter(u => u.id !== currentUserId && 
    (u.username || '').toLowerCase().includes(searchText.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: theme.palette.background.default }}>
      <ChatUsersList
        users={filteredUsers}
        loading={usersLoading}
        error={usersError}
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedUserId={selectedUser?.id}
        onSelectUser={setSelectedUser}
      />
      <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <ChatHeader selectedUser={selectedUser} />
            <ChatMessages
              messages={messages}
              loading={messagesLoading}
              error={error}
              currentUserId={currentUserId}
              selectedUser={selectedUser}
            />
            <ChatInput
              messageText={messageText}
              onMessageChange={setMessageText}
              onSendMessage={sendMessage}
              onKeyPress={handleKeyPress}
              loading={sendingMessage}
            />
          </>
        ) : (
          <ChatEmpty />
        )}
      </Box>
    </Box>
  );
};

export default ChatView;
