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
  const [attachment, setAttachment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserUsername, setCurrentUserUsername] = useState('');

  const roomName = currentUserId && selectedUser
    ? [currentUserId, selectedUser.id].sort().join('_')
    : null;
  const wsUrl = roomName ? `ws://localhost:8000/ws/chat/${roomName}/` : null;

  useWebSocket(wsUrl, (data) => {
    if (data.type === 'chat_message' && data.message) {
      setMessages((prevMessages) => {
        if (prevMessages.some(msg => msg.id === data.message.id)) {
          return prevMessages;
        }
        return [...prevMessages, data.message];
      });
    }
  });

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
      setMessageText('');
      setAttachment(null);
    }
  }, [selectedUser]);

  const sendMessage = async () => {
    if ((!messageText.trim() && !attachment) || !selectedUser) return;

    const tempId = `temp-${Date.now()}`;
    
    // ✅ 1. Optymistyczna aktualizacja z TYPEM pliku
    const optimisticMessage = {
      id: tempId,
      sender: currentUserId,
      sender_id: currentUserId,
      sender_username: currentUserUsername,
      recipient: selectedUser.id,
      recipient_username: selectedUser.username,
      content: messageText,
      // URL lokalny do podglądu
      attachment_url: attachment ? URL.createObjectURL(attachment) : null,
      // WAŻNE: Przekazujemy typ, żeby ChatMessage wiedział czy to PDF czy obrazek
      attachment_type: attachment ? attachment.type : null, 
      created_at: new Date().toISOString(),
      is_read: false,
    };

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

      setMessages((prev) => 
        prev.map(msg => msg.id === tempId ? response.data : msg)
      );

    } catch (err) {
      console.error('Błąd wysyłania:', err);
      setError('Nie udało się wysłać wiadomości');
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
      setMessageText('');
      setAttachment(null);
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

export default ChatView;