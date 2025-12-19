// src/views/ChatPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  // Pobieramy użytkowników z API (to jest baza danych)
  const { data: apiUsers, loading: usersLoading, error: usersError } = useUsers();

  // Mapa statusów online aktualizowana przez WebSocket { userId: boolean }
  const [onlineStatuses, setOnlineStatuses] = useState({});
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserUsername, setCurrentUserUsername] = useState('');

  // --- 1. OBSŁUGA STATUSÓW ONLINE (WebSocket) ---
  const handlePresenceMessage = useCallback((data) => {
    if (data.type === 'presence_update') {
      setOnlineStatuses(prev => ({
        ...prev,
        // WAŻNE: Konwersja na Number, bo WS może przysłać string "5", a API ma liczbę 5
        [Number(data.user_id)]: data.status === 'online'
      }));
    }
  }, []);

  useWebSocket('ws://127.0.0.1:8000/ws/notifications/', handlePresenceMessage);

  // --- 2. LISTA UŻYTKOWNIKÓW (COMPUTED STATE) ---
  // Łączymy dane z API (bazowe) ze statusem z WebSocketa (live)
  // Używamy useMemo, aby lista była zawsze świeża i przeliczana automatycznie
  const users = useMemo(() => {
    if (!apiUsers) return [];
    
    return apiUsers.map(u => {
        // Sprawdzamy status w mapie (WS). Jeśli brak, bierzemy z API (Baza). Jeśli brak, false.
        const wsStatus = onlineStatuses[u.id];
        const isOnline = wsStatus !== undefined ? wsStatus : (u.is_online || false);
        
        return {
            ...u,
            is_online: isOnline
        };
    });
  }, [apiUsers, onlineStatuses]);

  // Synchronizacja statusu wybranego użytkownika
  // Jeśli status usera na liście się zmienił, aktualizujemy też obiekt selectedUser
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser && updatedUser.is_online !== selectedUser.is_online) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);


  // --- 3. OBSŁUGA CZATU ---
  const roomName = currentUserId && selectedUser
    ? [currentUserId, selectedUser.id].sort((a, b) => a - b).join('_')
    : null;
    
  const wsUrl = roomName ? `ws://localhost:8000/ws/chat/${roomName}/` : null;

  const handleIncomingMessage = useCallback((data) => {
    if (data.type === 'chat_message' && data.message) {
      setMessages((prevMessages) => {
        if (data.temp_id) {
          const exists = prevMessages.some(msg => msg.id === data.temp_id);
          if (exists) {
            return prevMessages.map(msg => 
              msg.id === data.temp_id ? data.message : msg
            );
          }
        }
        if (prevMessages.some(msg => msg.id === data.message.id)) {
          return prevMessages;
        }
        return [...prevMessages, data.message];
      });
    }
  }, []);

  const { send } = useWebSocket(wsUrl, handleIncomingMessage);

  // Pobranie current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await API.get('/court/auth/me/');
        setCurrentUserId(response.data.id);
        setCurrentUserUsername(response.data.username);
      } catch (err) {
        console.error('Err fetch user', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Pobranie historii wiadomości
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

  // Wysyłanie wiadomości
  const sendMessage = async (content, attachments = []) => {
    if (!selectedUser) return;
    if (!content.trim() && attachments.length === 0) return;

    setSendingMessage(true);

    try {
      if (attachments.length === 0 && content.trim()) {
        const tempId = `temp-${Date.now()}`;
        
        const optimisticMessage = {
          id: tempId,
          sender: currentUserId,
          sender_id: currentUserId,
          sender_username: currentUserUsername,
          recipient: selectedUser.id,
          recipient_username: selectedUser.username,
          content: content,
          attachment: null,
          created_at: new Date().toISOString(),
          is_read: false,
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        if (send && typeof send === 'function') {
            send({
              type: 'chat_message',
              recipient_id: selectedUser.id,
              content: content,
              temp_id: tempId 
            });
        } else {
            console.error("⚠️ WebSocket nie jest gotowy.");
            setError("Brak połączenia. Odśwież stronę.");
        }
      }
      else if (attachments.length > 0) {
          for (const file of attachments) {
            const tempId = `temp-file-${Date.now()}-${Math.random()}`;

            const optimisticFileMessage = {
              id: tempId,
              sender: currentUserId,
              sender_id: currentUserId,
              sender_username: currentUserUsername,
              recipient: selectedUser.id,
              recipient_username: selectedUser.username,
              content: content || 'Przesłano plik',
              attachment: file, 
              created_at: new Date().toISOString(),
              is_read: false,
              is_temp: true 
            };

            setMessages((prev) => [...prev, optimisticFileMessage]);

            const formData = new FormData();
            formData.append('recipient_id', selectedUser.id);
            formData.append('content', content || 'Przesłano plik'); 
            formData.append('attachment', file);

            const response = await API.post('/court/messages/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setMessages((prev) => {
              const realMessageAlreadyExists = prev.some(msg => msg.id === response.data.id);

              if (realMessageAlreadyExists) {
                return prev.filter(msg => msg.id !== tempId);
              } else {
                return prev.map(msg => 
                  msg.id === tempId ? response.data : msg
                );
              }
            });
          }
      }

    } catch (err) {
      console.error('Błąd wysyłania:', err);
      setError('Nie udało się wysłać wiadomości');
    } finally {
      setSendingMessage(false);
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
              onSendMessage={sendMessage}
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