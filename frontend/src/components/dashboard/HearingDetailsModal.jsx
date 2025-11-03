// src/components/modals/HearingDetailsModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
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
  useTheme,
} from '@mui/material';
import API from '../../api/axiosConfig';

const HearingDetailsModal = ({ open, hearing, onClose }) => {
  const theme = useTheme();
  const [judgeData, setJudgeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch judge data
  const fetchJudgeData = useCallback(async (judgeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/court/users/${judgeId}/`);
      setJudgeData(response.data);
    } catch (err) {
      setError('Nie udało się pobrać danych sędziego');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch judge data when modal opens
  useEffect(() => {
    if (open && hearing?.judge) {
      fetchJudgeData(hearing.judge);
    } else {
      setJudgeData(null);
      setError(null);
    }
  }, [open, hearing?.judge, fetchJudgeData]);

  if (!hearing) return null;

  const getStatusLabel = (status) => {
    const statusMap = {
      zaplanowana: '📋 Zaplanowana',
      odbyta: '✅ Odbyta',
      odłożona: '⏸️ Odłożona',
    };
    return statusMap[status] || status;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      return new Date(dateTime).toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

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
        📅 Szczegóły rozprawy
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          pt: 3,
        }}
      >
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
            {hearing.case_number || 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

        {/* GODZINA I DATA */}
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
            Data i godzina
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              mt: 0.5,
              fontWeight: '500',
            }}
          >
            {formatDateTime(hearing.date_time)}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

        {/* SALA */}
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
            Sala sądowa
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              mt: 0.5,
              fontWeight: '500',
            }}
          >
            {hearing.location || 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

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
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              mt: 0.5,
              fontWeight: '500',
            }}
          >
            {getStatusLabel(hearing.status)}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

        {/* SĘDZIA - Z DANYMI */}
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
            Sędzia prowadzący
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          ) : judgeData ? (
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                bgcolor: theme.palette.mode === 'light'
                  ? 'rgba(0, 0, 0, 0.02)'
                  : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Imię i Nazwisko */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  Imię i nazwisko
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: '600',
                    mt: 0.25,
                  }}
                >
                  {`${judgeData.first_name || 'N/A'} ${judgeData.last_name || 'N/A'}`}
                </Typography>
              </Box>

              {/* Email */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  Email
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    mt: 0.25,
                    '&:hover': {
                      textDecoration: 'underline',
                      opacity: 0.8,
                    },
                  }}
                  onClick={() => {
                    if (judgeData.email) {
                      window.location.href = `mailto:${judgeData.email}`;
                    }
                  }}
                >
                  {judgeData.email || 'Brak emaila'}
                </Typography>
              </Box>

              {/* Telefon */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  Numer telefonu
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    cursor: judgeData.phone ? 'pointer' : 'default',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    mt: 0.25,
                    '&:hover': {
                      textDecoration: judgeData.phone ? 'underline' : 'none',
                      opacity: judgeData.phone ? 0.8 : 1,
                    },
                  }}
                  onClick={() => {
                    if (judgeData.phone) {
                      window.location.href = `tel:${judgeData.phone}`;
                    }
                  }}
                >
                  {judgeData.phone || 'Brak numeru telefonu'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mt: 1,
                fontStyle: 'italic',
              }}
            >
              Brak przypisanego sędziego
            </Typography>
          )}
        </Box>

        {hearing.notes && (
          <>
            <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />

            {/* NOTATKI */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Notatki
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 0.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {hearing.notes}
              </Typography>
            </Box>
          </>
        )}
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
            },
          }}
        >
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HearingDetailsModal;
