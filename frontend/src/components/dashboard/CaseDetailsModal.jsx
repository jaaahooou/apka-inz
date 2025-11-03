// src/components/CaseDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import StatusChip from '../common/StatusChip';
import API from '../../api/axiosConfig';

const CaseDetailsModal = ({ open, caseData, onClose }) => {
  const theme = useTheme();
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && caseData?.id) {
      fetchCaseDetails(caseData.id);
    }
  }, [open, caseData]);

  const fetchCaseDetails = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/court/cases/${caseId}/`);
      setFullData(response.data);
    } catch (err) {
      setError('Nie udało się pobrać danych sprawy');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: theme.palette.background.paper, 
          color: theme.palette.text.primary, 
          fontWeight: 'bold',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        📋 Szczegóły sprawy
      </DialogTitle>
      
      <DialogContent 
        sx={{ 
          bgcolor: theme.palette.background.default, 
          color: theme.palette.text.primary, 
          pt: 3,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : fullData ? (
          <>
            {/* NUMER SPRAWY */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Numer sprawy
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.primary, 
                  mt: 0.5,
                  fontWeight: '500',
                }}
              >
                {fullData.case_number}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

            {/* TYTUŁ */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Tytuł
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.primary, 
                  mt: 0.5,
                  fontWeight: '500',
                }}
              >
                {fullData.title}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

            {/* OPIS */}
            {fullData.description && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary, 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Opis
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.primary, 
                      mt: 0.5, 
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {fullData.description}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />
              </>
            )}

            {/* STATUS */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusChip status={fullData.status} />
              </Box>
            </Box>

            <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

            {/* DATA UTWORZENIA */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Data utworzenia
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.primary, 
                  mt: 0.5,
                  fontWeight: '500',
                }}
              >
                {new Date(fullData.created_at).toLocaleDateString('pl-PL')}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

            {/* LICZBA ROZPRAW */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Liczba rozpraw
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={fullData.hearings_count || 0}
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                    fontWeight: '500',
                  }}
                />
              </Box>
            </Box>

            {/* LICZBA UCZESTNIKÓW */}
            <Box sx={{ mb: 0 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Liczba uczestników
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={fullData.participants_count || 0}
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.success?.main || '#4caf50',
                    color: '#fff',
                    fontWeight: '500',
                  }}
                />
              </Box>
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions 
        sx={{ 
          bgcolor: theme.palette.background.paper, 
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
            fontWeight: '500',
            '&:hover': { 
              backgroundColor: theme.palette.primary.dark,
              opacity: 0.9,
            },
          }}
        >
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaseDetailsModal;
