// src/pages/Chat/ChatPage.jsx
import React, { useState } from 'react';
import { Grid, Container, Box, Typography } from '@mui/material';
import ChatRoomList from './ChatRoomList';
import MessagesList from './MessagesList';

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  
  // Pobierz ID zalogowanego użytkownika z localStorage lub contextu
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 120px)', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} sm={4} sx={{ height: '100%', overflow: 'hidden' }}>
          <ChatRoomList
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        </Grid>
        <Grid item xs={12} sm={8} sx={{ height: '100%', overflow: 'hidden' }}>
          <MessagesList
            roomId={selectedRoomId}
            currentUserId={currentUserId}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;
