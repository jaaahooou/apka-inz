// src/views/Dashboard.jsx
import React, { useState } from 'react';
import {
  Box,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import HearingsTodayCard from '../components/dashboard/HearingsTodayCard';
import RecentCasesCard from '../components/dashboard/RecentCasesCard';
import StatusChip from '../components/common/StatusChip';

const Dashboard = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState('aktywne');

  // Ostatnie dokumenty
  const recentDocuments = [
    {
      id: 1,
      title: 'Pismo procesowe - CASE-2025-001',
      uploadedBy: 'Jan Kowalski',
      uploadedAt: '1h temu',
      size: '2.3 MB',
      caseNumber: 'CASE-2025-001',
    },
    {
      id: 2,
      title: 'Protokół rozprawy - CASE-2025-005',
      uploadedBy: 'Maria Zalewska',
      uploadedAt: '3h temu',
      size: '1.1 MB',
      caseNumber: 'CASE-2025-005',
    },
    {
      id: 3,
      title: 'Umowa - CASE-2025-010',
      uploadedBy: 'Adam Nowak',
      uploadedAt: 'Wczoraj',
      size: '5.7 MB',
      caseNumber: 'CASE-2025-010',
    },
  ];

  // Powiadomienia
  const notifications = [
    {
      id: 1,
      type: 'hearing',
      message: 'Rozprawa w sprawie CASE-2025-001 zaplanowana na 10:00',
      time: '30 min temu',
    },
    {
      id: 2,
      type: 'document',
      message: 'Dodano nowy dokument do sprawy CASE-2025-005',
      time: '1h temu',
    },
    {
      id: 3,
      type: 'status',
      message: 'Status sprawy CASE-2025-010 zmieniony na "aktywna"',
      time: '2h temu',
    },
    {
      id: 4,
      type: 'participant',
      message: 'Dodano nowego uczestnika do sprawy CASE-2025-008',
      time: '4h temu',
    },
        {
      id: 5,
      type: 'participant',
      message: 'Dodano nowego uczestnika do sprawy test',
      time: '4h temu',
    },
  ];

  // Dziennik audytu
  const auditLogs = [
    {
      id: 1,
      user: 'admin',
      action: 'UPDATE',
      object: 'Hearing #1',
      timestamp: '10:30',
      ip: '192.168.1.1',
    },
    {
      id: 2,
      user: 'jan_kowalski',
      action: 'CREATE',
      object: 'Document',
      timestamp: '10:15',
      ip: '192.168.1.50',
    },
    {
      id: 3,
      user: 'maria_zalewska',
      action: 'UPDATE',
      object: 'Case #5',
      timestamp: '09:45',
      ip: '192.168.1.75',
    },
  ];

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        p: 3, 
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar />

      {/* SZYBKI PRZEGLĄD - Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <StatsCard title="Sprawy" value="12" color="primary" />
        <StatsCard title="Rozprawy dzisiaj" value="3" color="info" />
        <StatsCard title="Dokumenty" value="5" color="warning" />
        <StatsCard title="Powiadomienia" value="8" color="error" />
      </Box>

      <Grid container spacing={3}>
        {/* KOLUMNA 1 - Rozprawy dzisiaj i ostatnie sprawy */}
        <Grid item xs={12} md={8}>
          {/* ✅ HEARINGS TODAY COMPONENT */}
          <HearingsTodayCard />

          {/* ✅ RECENT CASES COMPONENT */}
          <RecentCasesCard />
        </Grid>

        {/* KOLUMNA 2 - Dokumenty, powiadomienia, audyt */}
        <Grid item xs={12} md={4}>
          {/* Ostatnie dokumenty */}
          <Card 
            sx={{ 
              mb: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            <CardHeader
              title="📄 Ostatnie dokumenty"
              titleTypographyProps={{ 
                variant: 'h6', 
                sx: { 
                  color: theme.palette.text.primary,
                  fontWeight: '600',
                } 
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <ListItem
                      sx={{
                        p: 2,
                        '&:hover': { 
                          backgroundColor: theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.04)'
                            : 'rgba(255, 255, 255, 0.08)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: theme.palette.text.primary 
                            }}
                          >
                            {doc.title}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              mt: 0.5,
                              display: 'block',
                            }}
                          >
                            {doc.uploadedBy} • {doc.uploadedAt} • {doc.size}
                          </Typography>
                        }
                      />
                      <Tooltip title="Pobierz">
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < recentDocuments.length - 1 && 
                      <Divider sx={{ borderColor: theme.palette.divider }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Powiadomienia */}
          <Card 
            sx={{ 
              mb: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            <CardHeader
              title="🔔 Powiadomienia"
              titleTypographyProps={{ 
                variant: 'h6', 
                sx: { 
                  color: theme.palette.text.primary,
                  fontWeight: '600',
                } 
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {notifications.map((notif, index) => (
                  <React.Fragment key={notif.id}>
                    <ListItem 
                      sx={{ 
                        p: 2, 
                        alignItems: 'flex-start',
                        '&:hover': { 
                          backgroundColor: theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.04)'
                            : 'rgba(255, 255, 255, 0.08)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: 32, 
                          height: 32, 
                          fontSize: '1rem',
                          backgroundColor: theme.palette.mode === 'light'
                            ? 'rgba(25, 118, 210, 0.1)'
                            : 'rgba(224, 224, 224, 0.1)',
                          color: theme.palette.primary.main,
                        }}
                      >
                        {notif.type === 'hearing'
                          ? '📅'
                          : notif.type === 'document'
                          ? '📄'
                          : notif.type === 'status'
                          ? '✓'
                          : '👤'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.primary,
                            }}
                          >
                            {notif.message}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              mt: 0.5,
                              display: 'block',
                            }}
                          >
                            {notif.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && 
                      <Divider sx={{ borderColor: theme.palette.divider }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Dziennik audytu (Admin) */}
          <Card
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            <CardHeader
              title="📊 Ostatnia aktywność"
              titleTypographyProps={{ 
                variant: 'h6', 
                sx: { 
                  color: theme.palette.text.primary,
                  fontWeight: '600',
                } 
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {auditLogs.map((log, index) => (
                  <React.Fragment key={log.id}>
                    <ListItem 
                      sx={{ 
                        p: 2, 
                        alignItems: 'flex-start',
                        '&:hover': { 
                          backgroundColor: theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.04)'
                            : 'rgba(255, 255, 255, 0.08)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.primary,
                            }}
                          >
                            <strong>{log.user}</strong> {log.action}{' '}
                            <strong>{log.object}</strong>
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              mt: 0.5,
                              display: 'block',
                            }}
                          >
                            {log.timestamp} • {log.ip}
                          </Typography>
                        }
                      />
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action)}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                    {index < auditLogs.length - 1 && 
                      <Divider sx={{ borderColor: theme.palette.divider }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
