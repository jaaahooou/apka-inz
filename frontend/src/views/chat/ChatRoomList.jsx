import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Button,
  Dialog,
  TextField,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import chatAPI from '../../api/chatAPI';

const ChatRoomList = ({ selectedRoomId, onSelectRoom, onRoomCreated, onRoomDeleted }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatRooms();
      setRooms(response.data);
    } catch (err) {
      setError('Nie udało się pobrać pokojów');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setError('Nazwa pokoju nie może być pusta');
      return;
    }

    try {
      const response = await chatAPI.createChatRoom(newRoomName);
      setRooms([response.data, ...rooms]);
      setNewRoomName('');
      setOpenDialog(false);
      onRoomCreated?.(response.data);
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Błąd przy tworzeniu pokoju');
      console.error(err);
    }
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Czy na pewno chcesz usunąć ten pokój?')) return;

    try {
      await chatAPI.deleteChatRoom(roomId);
      setRooms(rooms.filter(room => room.id !== roomId));
      if (selectedRoomId === roomId) {
        onSelectRoom(null);
      }
      onRoomDeleted?.(roomId);
    } catch (err) {
      setError('Nie udało się usunąć pokoju');
      console.error(err);
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Nowy pokój
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {rooms.length === 0 ? (
            <ListItem>
              <ListItemText primary="Brak pokojów" />
            </ListItem>
          ) : (
            rooms.map(room => (
              <ListItem key={room.id} disablePadding secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleDeleteRoom(room.id, e)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemButton
                  selected={selectedRoomId === room.id}
                  onClick={() => onSelectRoom(room.id)}
                >
                  <ListItemText
                    primary={room.name}
                    secondary={new Date(room.created_at).toLocaleDateString('pl-PL')}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Nazwa pokoju"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            error={!!error}
            helperText={error}
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button variant="contained" onClick={handleCreateRoom}>
              Utwórz
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
};

export default ChatRoomList;