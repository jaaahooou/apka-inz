import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import HearingsTodayCard from '../components/dashboard/HearingsTodayCard';
import RecentCasesCard from '../components/dashboard/RecentCasesCard';
import StatusChip from '../components/common/StatusChip';
import API from '../api/axiosConfig.js';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [filter, setFilter] = useState('aktywne');
  
  // State dla powiadomień
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState(null);

  // State dla dokumentów
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState(null);

  // State dla logów audytu
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [auditLogError, setAuditLogError] = useState(null);

  // State dla statystyk
  const [stats, setStats] = useState({
    totalCases: 0,
    hearingsToday: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Sprawdź czy użytkownik jest adminem
  const isAdmin = ['ADMIN', 'Admin', 'Sekretariat', 'SEKRETARIAT'].includes(user?.role || '');

  // Pobierz statystyki (sprawy i rozprawy dzisiaj)
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setLoadingStats(true);

        // Pobierz wszystkie sprawy i rozprawy
        const [casesRes, hearingsRes] = await Promise.all([
          API.get('/court/cases/'),
          API.get('/court/hearings/')
        ]);

        const allCases = casesRes.data;
        const allHearings = hearingsRes.data;
        const userRole = user?.role || '';

        console.log('Wszystkie sprawy:', allCases.length);
        console.log('Wszystkie rozprawy:', allHearings.length);

        // Filtruj sprawy użytkownika
        let filteredCases = [];

        if (['ADMIN', 'Admin', 'Sekretariat', 'SEKRETARIAT', 'Asystent sędziego', 'asystent sedziego'].includes(userRole)) {
          filteredCases = allCases;
        } else if (['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(userRole)) {
          const hearingCaseIds = allHearings
            .filter(h => h.judge_username === user.username)
            .map(h => typeof h.case === 'object' ? h.case.id : h.case);

          filteredCases = allCases.filter(c => 
            c.assigned_judge_username === user.username ||
            hearingCaseIds.includes(c.id) ||
            c.creator_username === user.username
          );
        } else {
          filteredCases = allCases.filter(c => c.creator_username === user.username);
        }

        const userCaseIds = filteredCases.map(c => c.id);

        // Policz rozprawy na dziś dla spraw użytkownika
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const hearingsToday = allHearings.filter(h => {
          const hearingDate = new Date(h.hearing_date || h.date);
          const hearingDateStr = hearingDate.toISOString().split('T')[0];
          const caseId = typeof h.case === 'object' ? h.case.id : h.case;
          
          return hearingDateStr === todayStr && userCaseIds.includes(caseId);
        });

        console.log('Sprawy użytkownika:', filteredCases.length);
        console.log('Rozprawy na dziś:', hearingsToday.length);

        setStats({
          totalCases: filteredCases.length,
          hearingsToday: hearingsToday.length,
        });

      } catch (err) {
        console.error('Błąd pobierania statystyk:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Pobierz powiadomienia z API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await API.get('/court/notifications/');
        console.log('Powiadomienia z API:', response.data);
        setNotifications(response.data);
        setNotificationError(null);
      } catch (err) {
        console.error('Błąd pobierania powiadomień:', err);
        setNotificationError('Nie udało się pobrać powiadomień.');
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  // Pobierz ostatnie dokumenty z API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const response = await API.get('/court/documents/');
        console.log('Dokumenty z API:', response.data);
        // Sortuj po dacie i weź 3 najnowsze
        const sortedDocs = response.data
          .sort((a, b) => new Date(b.uploaded_at || b.created_at) - new Date(a.uploaded_at || a.created_at))
          .slice(0, 3);
        setDocuments(sortedDocs);
        setDocumentError(null);
      } catch (err) {
        console.error('Błąd pobierania dokumentów:', err);
        setDocumentError('Nie udało się pobrać dokumentów.');
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, []);

  // Pobierz logi audytu z API - TYLKO DLA ADMINÓW
  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!isAdmin) {
        setLoadingAuditLogs(false);
        return;
      }

      try {
        setLoadingAuditLogs(true);
        const response = await API.get('/court/audit-logs/');
        console.log('Logi audytu z API:', response.data);
        // Weź 3 najnowsze
        const recentLogs = response.data
          .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
          .slice(0, 3);
        setAuditLogs(recentLogs);
        setAuditLogError(null);
      } catch (err) {
        console.error('Błąd pobierania logów audytu:', err);
        setAuditLogError('Nie udało się pobrać aktywności.');
      } finally {
        setLoadingAuditLogs(false);
      }
    };

    fetchAuditLogs();
  }, [isAdmin]);

  // Funkcja do formatowania czasu
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Brak daty';
    
    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return 'Nieprawidłowa data';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Przed chwilą';
      if (diffMins < 60) return `${diffMins} min temu`;
      if (diffHours < 24) return `${diffHours}h temu`;
      if (diffDays === 1) return 'Wczoraj';
      if (diffDays < 7) return `${diffDays} dni temu`;
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Błąd formatowania daty:', timestamp, error);
      return 'Błąd daty';
    }
  };

  // Funkcja do formatowania rozmiaru pliku
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Funkcja do określenia ikony powiadomienia
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'hearing':
      case 'HEARING':
        return '📅';
      case 'document':
      case 'DOCUMENT':
        return '📄';
      case 'status':
      case 'STATUS':
        return '✓';
      case 'participant':
      case 'PARTICIPANT':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getActionColor = (action) => {
    const actionUpper = action?.toUpperCase();
    switch (actionUpper) {
      case 'CREATE':
      case 'CREATED':
        return 'success';
      case 'UPDATE':
      case 'UPDATED':
        return 'info';
      case 'DELETE':
      case 'DELETED':
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
        <StatsCard 
          title="Sprawy" 
          value={loadingStats ? '...' : stats.totalCases.toString()} 
          color="primary" 
        />
        <StatsCard 
          title="Rozprawy dzisiaj" 
          value={loadingStats ? '...' : stats.hearingsToday.toString()} 
          color="info" 
        />
        <StatsCard 
          title="Dokumenty" 
          value={documents.length.toString()} 
          color="warning" 
        />
        <StatsCard 
          title="Powiadomienia" 
          value={notifications.length.toString()} 
          color="error" 
        />
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
          {/* Ostatnie dokumenty - Z API */}
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
              {loadingDocuments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : documentError ? (
                <Alert severity="error" sx={{ m: 2 }}>{documentError}</Alert>
              ) : documents.length === 0 ? (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    color: theme.palette.text.secondary 
                  }}
                >
                  Brak dokumentów
                </Typography>
              ) : (
                <List disablePadding>
                  {documents.map((doc, index) => (
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
                              {doc.title || doc.name || 'Dokument bez nazwy'}
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
                              {doc.uploaded_by || doc.creator || 'Nieznany'} • {formatTime(doc.uploaded_at || doc.created_at)} • {formatFileSize(doc.file_size || doc.size)}
                            </Typography>
                          }
                        />
                        <Tooltip title="Pobierz">
                          <IconButton 
                            size="small" 
                            onClick={() => window.open(doc.file || doc.url, '_blank')}
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
                      {index < documents.length - 1 && 
                        <Divider sx={{ borderColor: theme.palette.divider }} />
                      }
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Powiadomienia - Z API */}
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
              {loadingNotifications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : notificationError ? (
                <Alert severity="error" sx={{ m: 2 }}>{notificationError}</Alert>
              ) : notifications.length === 0 ? (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    color: theme.palette.text.secondary 
                  }}
                >
                  Brak powiadomień
                </Typography>
              ) : (
                <List disablePadding>
                  {notifications.slice(0, 5).map((notif, index) => (
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
                          {getNotificationIcon(notif.type || notif.notification_type)}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.primary,
                              }}
                            >
                              {notif.message || notif.content}
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
                              {formatTime(notif.created_at || notif.timestamp)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < Math.min(notifications.length, 5) - 1 && 
                        <Divider sx={{ borderColor: theme.palette.divider }} />
                      }
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Dziennik audytu - TYLKO DLA ADMINÓW */}
          {isAdmin && (
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
                {loadingAuditLogs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : auditLogError ? (
                  <Alert severity="error" sx={{ m: 2 }}>{auditLogError}</Alert>
                ) : auditLogs.length === 0 ? (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      color: theme.palette.text.secondary 
                    }}
                  >
                    Brak aktywności
                  </Typography>
                ) : (
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
                                <strong>{log.user || log.username || log.performed_by}</strong> {log.action}{' '}
                                <strong>{log.object || log.object_type}</strong>
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
                                {formatTime(log.timestamp || log.created_at)} {log.ip_address && `• ${log.ip_address}`}
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
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
