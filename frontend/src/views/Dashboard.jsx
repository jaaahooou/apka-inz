import React, { useState } from 'react';
import {
  Box,
  Toolbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import HearingsTodayCard from '../components/dashboard/HearingsTodayCard';

const Dashboard = () => {
  const [filter, setFilter] = useState('aktywne');

  // Ostatnie sprawy
  const recentCases = [
    {
      id: 1,
      caseNumber: 'CASE-2025-010',
      title: 'Sprawa sprzedaży nieruchomości',
      status: 'aktywna',
      updatedAt: '2h temu',
      participants: 3,
    },
    {
      id: 2,
      caseNumber: 'CASE-2025-009',
      title: 'Sprawa rozwiązania umowy',
      status: 'aktywna',
      updatedAt: '4h temu',
      participants: 2,
    },
    {
      id: 3,
      caseNumber: 'CASE-2025-008',
      title: 'Sprawa o odszkodowanie',
      status: 'zamknięta',
      updatedAt: 'Wczoraj',
      participants: 4,
    },
  ];

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'zaplanowana':
        return 'info';
      case 'odbyta':
        return 'success';
      case 'odłożona':
        return 'warning';
      case 'aktywna':
        return 'success';
      case 'zamknięta':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'zaplanowana':
        return 'Zaplanowana';
      case 'odbyta':
        return 'Odbyta';
      case 'odłożona':
        return 'Odłożona';
      case 'aktywna':
        return 'Aktywna';
      case 'zamknięta':
        return 'Zamknięta';
      default:
        return status;
    }
  };

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
        backgroundColor: '#1a1a1a', 
        minHeight: '100vh',
        color: '#fff'
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

          {/* Ostatnie sprawy */}
          <Card
            sx={{ 
              backgroundColor: '#2d2d2d',
              color: '#fff',
              border: '1px solid #404040'
            }}
          >
            <CardHeader
              title="📋 Ostatnie sprawy"
              subheader="Ostatnio edytowane sprawy"
              titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
              subheaderTypographyProps={{ sx: { color: '#b0b0b0' } }}
            />
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#1f1f1f' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>Numer sprawy</TableCell>
                    <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>Tytuł</TableCell>
                    <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>Status</TableCell>
                    <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>Uczestnicy</TableCell>
                    <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>Edytowana</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCases.map((caseItem) => (
                    <TableRow 
                      key={caseItem.id} 
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: '#363636' },
                        borderColor: '#404040'
                      }}
                    >
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: '#404040' }}>
                        {caseItem.caseNumber}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#404040' }}>
                        {caseItem.title}
                      </TableCell>
                      <TableCell sx={{ borderColor: '#404040' }}>
                        <Chip
                          label={getStatusLabel(caseItem.status)}
                          color={getStatusColor(caseItem.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#404040' }}>
                        {caseItem.participants}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#404040' }}>
                        {caseItem.updatedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* KOLUMNA 2 - Dokumenty, powiadomienia, audyt */}
        <Grid item xs={12} md={4}>
          {/* Ostatnie dokumenty */}
          <Card 
            sx={{ 
              mb: 3,
              backgroundColor: '#2d2d2d',
              color: '#fff',
              border: '1px solid #404040'
            }}
          >
            <CardHeader
              title="📄 Ostatnie dokumenty"
              titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <ListItem
                      sx={{
                        p: 2,
                        '&:hover': { backgroundColor: '#363636' },
                        borderColor: '#404040'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                            {doc.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                            {doc.uploadedBy} • {doc.uploadedAt} • {doc.size}
                          </Typography>
                        }
                      />
                      <Tooltip title="Pobierz">
                        <IconButton size="small" sx={{ color: '#b0b0b0' }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < recentDocuments.length - 1 && 
                      <Divider sx={{ borderColor: '#404040' }} />
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
              backgroundColor: '#2d2d2d',
              color: '#fff',
              border: '1px solid #404040'
            }}
          >
            <CardHeader
              title="🔔 Powiadomienia"
              titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {notifications.map((notif, index) => (
                  <React.Fragment key={notif.id}>
                    <ListItem 
                      sx={{ 
                        p: 2, 
                        alignItems: 'flex-start',
                        '&:hover': { backgroundColor: '#363636' }
                      }}
                    >
                      <Avatar sx={{ mr: 2, width: 32, height: 32, fontSize: '1rem', bgcolor: '#3d3d3d' }}>
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
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            {notif.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                            {notif.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && 
                      <Divider sx={{ borderColor: '#404040' }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Dziennik audytu (Admin) */}
          <Card
            sx={{ 
              backgroundColor: '#2d2d2d',
              color: '#fff',
              border: '1px solid #404040'
            }}
          >
            <CardHeader
              title="📊 Ostatnia aktywność"
              titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
            />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {auditLogs.map((log, index) => (
                  <React.Fragment key={log.id}>
                    <ListItem 
                      sx={{ 
                        p: 2, 
                        alignItems: 'flex-start',
                        '&:hover': { backgroundColor: '#363636' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            <strong>{log.user}</strong> {log.action}{' '}
                            <strong>{log.object}</strong>
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
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
                      <Divider sx={{ borderColor: '#404040' }} />
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
