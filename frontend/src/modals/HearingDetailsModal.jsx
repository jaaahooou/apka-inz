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
} from '@mui/material';
import API from '../api/axiosConfig';

const HearingDetailsModal = ({ open, hearing, onClose }) => {
  const [judgeData, setJudgeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pobierz dane sędziego gdy modal się otworzy
  useEffect(() => {
    if (open && hearing?.judge) {
      fetchJudgeData(hearing.judge);
    }
  }, [open, hearing]);

  const fetchJudgeData = async (judgeId) => {
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
  };

  if (!hearing) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2d2d2d', color: '#fff', fontWeight: 'bold' }}>
        📅 Szczegóły rozprawy
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 3 }}>
        {/* NUMER SPRAWY */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
            NUMER SPRAWY
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
            {hearing.case_number}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#404040', my: 2 }} />

        {/* GODZINA I DATA */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
            DATA I GODZINA
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
            {new Date(hearing.date_time).toLocaleString('pl-PL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#404040', my: 2 }} />

        {/* SALA */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
            SALA SĄDOWA
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
            {hearing.location}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#404040', my: 2 }} />

        {/* STATUS */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
            STATUS
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
            {hearing.status === 'zaplanowana' && '📋 Zaplanowana'}
            {hearing.status === 'odbyta' && '✅ Odbyta'}
            {hearing.status === 'odłożona' && '⏸️ Odłożona'}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#404040', my: 2 }} />

        {/* SĘDZIA - Z DANYMI */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
            SĘDZIA PROWADZĄCY
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
            <Box sx={{ mt: 1.5, p: 2, bgcolor: '#2d2d2d', borderRadius: 1, border: '1px solid #404040' }}>
              {/* Imię i Nazwisko */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                  Imię i nazwisko
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {judgeData.first_name} {judgeData.last_name}
                </Typography>
              </Box>

              {/* Email */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                  Email
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => window.location.href = `mailto:${judgeData.email}`}
                >
                  {judgeData.email}
                </Typography>
              </Box>

              {/* Telefon */}
              <Box>
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                  Numer telefonu
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => window.location.href = `tel:${judgeData.phone}`}
                >
                  {judgeData.phone}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
              Brak przypisanego sędziego
            </Typography>
          )}
        </Box>

        <Divider sx={{ bgcolor: '#404040', my: 2 }} />

        {/* NOTATKI */}
        {hearing.notes && (
          <Box>
            <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
              NOTATKI
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {hearing.notes}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2d2d2d', p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            bgcolor: '#1976d2',
            color: '#fff',
            '&:hover': { bgcolor: '#1565c0' }
          }}
        >
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HearingDetailsModal;