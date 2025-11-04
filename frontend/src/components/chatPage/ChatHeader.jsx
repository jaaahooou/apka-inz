// src/components/chat/ChatHeader.jsx
import React from 'react';
import {
  Paper,
  Box,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatHeader = ({ selectedUser }) => {
  const theme = useTheme();

  return (
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
          {selectedUser?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: '600',
              color: theme.palette.text.primary,
            }}
          >
            {selectedUser?.username}
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
  );
};

export default ChatHeader;
