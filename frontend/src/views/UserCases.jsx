// src/views/CasesView.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Container,
  Typography,
  Chip,
  Tooltip,
  Card,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import API from '../api/axiosConfig';

const CasesView = () => {
  const theme = useTheme();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await API.get('/court/cases/');
      setCases(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError('Błąd przy pobieraniu spraw');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (caseData) => {
    setEditingCase(caseData);
    setFormData(caseData);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCase(null);
    setFormData({});
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      await API.put(`/court/cases/${formData.id}/`, formData);
      setCases(cases.map(c => c.id === formData.id ? formData : c));
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError('Błąd przy zapisywaniu sprawy');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę sprawę?')) {
      try {
        await API.delete(`/court/cases/${id}/`);
        setCases(cases.filter(c => c.id !== id));
        setError(null);
      } catch (err) {
        setError('Błąd przy usuwaniu sprawy');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  const getStatusConfig = (status) => {
    const configs = {
      in_progress: {
        label: 'W toku',
        color: 'info',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        textColor: '#1976D2',
        icon: '⏱️',
      },
      resolved: {
        label: 'Rozstrzygnięta',
        color: 'success',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        textColor: '#388E3C',
        icon: '✅',
      },
      suspended: {
        label: 'Zawieszona',
        color: 'warning',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        textColor: '#F57C00',
        icon: '⏸️',
      },
      dismissed: {
        label: 'Umorzono',
        color: 'error',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        textColor: '#C62828',
        icon: '❌',
      },
    };
    return configs[status] || configs.in_progress;
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header z animacją */}
        <Box
          sx={{
            mb: 4,
            animation: 'fadeIn 0.8s ease-in',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Moje sprawy
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            Zarządzaj swoimi sprawami sądowymi w jednym miejscu
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              animation: 'slideIn 0.4s ease-out',
              '@keyframes slideIn': {
                '0%': { opacity: 0, transform: 'translateX(-20px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress sx={{ width: 60, height: 60 }} />
          </Box>
        ) : cases.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '16px',
              boxShadow: theme.palette.mode === 'light'
                ? '0 8px 32px rgba(0, 0, 0, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '& th': {
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      py: 2.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    },
                  }}
                >
                  <TableCell>Numer sprawy</TableCell>
                  <TableCell>Tytuł</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sąd</TableCell>
                  <TableCell>Sędzia</TableCell>
                  <TableCell>Data otwarcia</TableCell>
                  <TableCell align="center">Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((caseItem, index) => {
                  const statusConfig = getStatusConfig(caseItem.status);
                  return (
                    <TableRow
                      key={caseItem.id}
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          transform: 'scale(1.01)',
                          boxShadow: `inset 0 0 20px ${theme.palette.primary.main}15`,
                        },
                        '&:not(:last-child) td': {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                        py: 1.5,
                        animation: `slideInUp 0.5s ease-out ${index * 0.05}s both`,
                        '@keyframes slideInUp': {
                          '0%': { opacity: 0, transform: 'translateY(10px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {caseItem.case_number}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {caseItem.title}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={caseItem.case_type}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<span>{statusConfig.icon}</span>}
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.textColor,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            '& .MuiChip-icon': {
                              marginLeft: '4px',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>{caseItem.court_name}</TableCell>
                      <TableCell>{caseItem.judge_name || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatDate(caseItem.opened_date)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edytuj">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(caseItem)}
                            sx={{
                              color: theme.palette.primary.main,
                              transition: 'all 0.3s',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main + '15',
                                transform: 'rotate(20deg) scale(1.1)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(caseItem.id)}
                            sx={{
                              color: theme.palette.error.main,
                              transition: 'all 0.3s',
                              '&:hover': {
                                backgroundColor: theme.palette.error.main + '15',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: theme.palette.mode === 'light'
                ? '0 8px 32px rgba(0, 0, 0, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Brak spraw
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Nie masz jeszcze żadnych spraw. Dodaj nową, aby zacząć.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Dodaj nową sprawę
            </Button>
          </Card>
        )}
      </Container>

      {/* Dialog edycji */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'light'
              ? '0 20px 60px rgba(0, 0, 0, 0.3)'
              : '0 20px 60px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Edytuj sprawę: {formData.case_number}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Numer sprawy"
            value={formData.case_number || ''}
            disabled
            fullWidth
            size="small"
          />
          <TextField
            label="Tytuł"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Opis"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
          <TextField
            select
            label="Typ sprawy"
            value={formData.case_type || ''}
            onChange={(e) => handleFieldChange('case_type', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="cywilna">Cywilna</MenuItem>
            <MenuItem value="karna">Karna</MenuItem>
            <MenuItem value="administracyjna">Administracyjna</MenuItem>
            <MenuItem value="pracy">Pracy</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={formData.status || ''}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="in_progress">W toku</MenuItem>
            <MenuItem value="resolved">Rozstrzygnięta</MenuItem>
            <MenuItem value="suspended">Zawieszona</MenuItem>
            <MenuItem value="dismissed">Umorzono</MenuItem>
          </TextField>
          <TextField
            label="Sąd"
            value={formData.court_name || ''}
            onChange={(e) => handleFieldChange('court_name', e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Sędzia"
            value={formData.judge_name || ''}
            onChange={(e) => handleFieldChange('judge_name', e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Data otwarcia"
            type="date"
            value={formData.opened_date ? formData.opened_date.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('opened_date', e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Zapisz zmiany
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CasesView;
