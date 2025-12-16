import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import API from '../api/axiosConfig';
import useUsers from '../hooks/useUsers'; 
import useWebSocket from '../hooks/useWebSocket';
import ChatUsersList from '../components/chatPage/ChatUsersList';
import ChatHeader from '../components/chatPage/ChatHeader';
import ChatMessages from '../components/chatPage/ChatMessages';
import ChatInput from '../components/chatPage/ChatInput';
import ChatEmpty from '../components/chatPage/ChatEmpty';

const ChatPage = () => {
  const theme = useTheme();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserUsername, setCurrentUserUsername] = useState('');

  // Logika WebSocket: Sortowanie ID, aby pokój "1_2" był taki sam dla obu stron
  const roomName = currentUserId && selectedUser
    ? [currentUserId, selectedUser.id].sort((a, b) => a - b).join('_')
    : null;
    
  // URL WebSocket - BEZ TOKENA (token dodaje hook useWebSocket)
  const wsUrl = roomName ? `ws://localhost:8000/ws/chat/${roomName}/` : null;

  // Obsługa wiadomości przychodzących
  const handleIncomingMessage = useCallback((data) => {
    if (data.type === 'chat_message' && data.message) {
      console.log("📩 Nowa wiadomość z WS:", data.message);
      setMessages((prevMessages) => {
        // Potwierdzenie wysłania (podmiana temp_id)
        if (data.temp_id) {
          const exists = prevMessages.some(msg => msg.id === data.temp_id);
          if (exists) {
            return prevMessages.map(msg => 
              msg.id === data.temp_id ? data.message : msg
            );
          }
        }

        // Deduplikacja (sprawdź po ID)
        if (prevMessages.some(msg => msg.id === data.message.id)) {
          return prevMessages.map(msg => msg.id === data.message.id ? data.message : msg);
        }

        // Nowa wiadomość
        return [...prevMessages, data.message];
      });
    }
  }, []);

  // Inicjalizacja WebSocket
  const { send } = useWebSocket(wsUrl, handleIncomingMessage);

  // Pobieranie danych zalogowanego użytkownika
  useEffect(() => {
    console.log(`📊 Aktualna liczba wiadomości w stanie: ${messages.length}`, messages);
  }, [messages]);

  // Pobieranie historii po wybraniu usera
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async (userId) => {
        try {
          setMessagesLoading(true);
          console.log(`📥 Pobieranie wiadomości dla odbiorcy ID: ${userId}`);
          const response = await API.get(`/court/messages/?recipient_id=${userId}`);
          console.log("📥 Pobrane wiadomości:", response.data);
          setMessages(response.data);
        } catch (err) {
          console.error("❌ Błąd fetchMessages:", err);
          setError('Błąd przy pobieraniu wiadomości');
        } finally {
          setMessagesLoading(false);
        }
      };
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Funkcja wysyłania
  const sendMessage = async (content, attachments = []) => {
    if (!selectedUser) return;
    if (!content.trim() && attachments.length === 0) return;

    setSendingMessage(true);

    try {
      // Tekst
      if (attachments.length === 0 && content.trim()) {
        const tempId = `temp-${Date.now()}`;
        
        // Optymistyczna aktualizacja UI
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

        // Wywołanie send
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
      
      // Załączniki
      else if (attachments.length > 0) {
          for (const file of attachments) {
            // TempId dla każdej wiadomości
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
      console.error('❌ Błąd wysyłania:', err);
      setError('Nie udało się wysłać wiadomości');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredUsers = users ? users.filter(u => 
      u.id !== currentUserId && 
      (u.username || '').toLowerCase().includes(searchText.toLowerCase())
  ) : [];

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', backgroundColor: theme.palette.background.default }}>
      <ChatUsersList
        users={filteredUsers}
        loading={usersLoading}
        error={usersError}
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedUserId={selectedUser?.id}
        onSelectUser={setSelectedUser}
      />
      <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedUser ? (
          <>
            <ChatHeader selectedUser={selectedUser} />
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <ChatMessages
                messages={messages}
                loading={messagesLoading}
                error={error}
                currentUserId={currentUserId}
                selectedUser={selectedUser}
                />
            </Box>

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

export default ChatPage;