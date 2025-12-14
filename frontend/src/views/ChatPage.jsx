import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Paper, Typography } from '@mui/material';
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
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserUsername, setCurrentUserUsername] = useState('');

  // 1. Pobierz ID zalogowanego użytkownika
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await API.get('/court/auth/me/');
        setCurrentUserId(response.data.id);
        setCurrentUserUsername(response.data.username);
        console.log("👤 Zalogowany użytkownik:", response.data);
      } catch (err) {
        console.error('❌ Błąd pobierania danych użytkownika:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // 2. Generowanie nazwy pokoju
  const roomName = currentUserId && selectedUser
    ? [currentUserId, selectedUser.id].sort((a, b) => a - b).join('_') 
    : null;

  // Używamy localhost dla spójności z logami
  const wsUrl = roomName ? `ws://localhost:8000/ws/chat/${roomName}/` : null;

  // 3. Obsługa WebSocket
  useWebSocket(wsUrl, (data) => {
    if (data.type === 'chat_message' && data.message) {
      console.log("📩 Nowa wiadomość z WS:", data.message);
      setMessages((prevMessages) => {
        // Zapobieganie duplikatom (jeśli wiadomość przyszła z REST API wcześniej)
        if (prevMessages.some(msg => msg.id === data.message.id)) {
          return prevMessages.map(msg => msg.id === data.message.id ? data.message : msg);
        }
        return [...prevMessages, data.message];
      });
    }
  });

  // Debugowanie stanu wiadomości
  useEffect(() => {
    console.log(`📊 Aktualna liczba wiadomości w stanie: ${messages.length}`, messages);
  }, [messages]);

  // 4. Pobieranie historii wiadomości
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
      setMessageText('');
      setAttachment(null);
    }
  }, [selectedUser]);

  // 5. Wysyłanie wiadomości
  const sendMessage = async () => {
    if ((!messageText.trim() && !attachment) || !selectedUser) return;

    const tempId = `temp-${Date.now()}`;
    
    // Optymistyczna wiadomość (pokazujemy od razu)
    const optimisticMessage = {
      id: tempId,
      sender: currentUserId,
      sender_id: currentUserId,
      sender_username: currentUserUsername,
      recipient: selectedUser.id,
      recipient_username: selectedUser.username,
      content: messageText,
      attachment: attachment ? URL.createObjectURL(attachment) : null,
      is_attachment: !!attachment,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    console.log("📤 Wysyłanie (optymistyczne):", optimisticMessage);
    setMessages((prev) => [...prev, optimisticMessage]);
    setSendingMessage(true);

    try {
      const formData = new FormData();
      formData.append('recipient_id', selectedUser.id);
      formData.append('content', messageText);
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await API.post('/court/messages/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ Wysłano pomyślnie (API response):", response.data);

      setMessages((prev) => 
        prev.map(msg => msg.id === tempId ? response.data : msg)
      );

    } catch (err) {
      console.error('❌ Błąd wysyłania:', err);
      setError('Nie udało się wysłać wiadomości');
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
      setMessageText('');
      setAttachment(null);
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
            
            {/* Poprawiony kontener dla wiadomości - flex i hidden overflow */}
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
              messageText={messageText}
              onMessageChange={setMessageText}
              onSendMessage={sendMessage}
              loading={sendingMessage}
              attachment={attachment}
              onAttachmentChange={setAttachment}
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