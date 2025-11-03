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
} from '@mui/material';
import StatusChip from '../common/StatusChip';
import API from '../../api/axiosConfig';

const CaseDetailsModal = ({ open, caseData, onClose }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2d2d2d', color: '#fff', fontWeight: 'bold' }}>
        📋 Szczegóły sprawy
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 3 }}>
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
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                NUMER SPRAWY
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
                {fullData.case_number}
              </Typography>
            </Box>

            <Divider sx={{ bgcolor: '#404040', my: 2 }} />

            {/* TYTUŁ */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                TYTUŁ
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
                {fullData.title}
              </Typography>
            </Box>

            <Divider sx={{ bgcolor: '#404040', my: 2 }} />

            {/* OPIS */}
            {fullData.description && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                    OPIS
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {fullData.description}
                  </Typography>
                </Box>

                <Divider sx={{ bgcolor: '#404040', my: 2 }} />
              </>
            )}

            {/* STATUS */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                STATUS
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusChip status={fullData.status} />
              </Box>
            </Box>

            <Divider sx={{ bgcolor: '#404040', my: 2 }} />

            {/* DATA UTWORZENIA */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                DATA UTWORZENIA
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', mt: 0.5 }}>
                {new Date(fullData.created_at).toLocaleDateString('pl-PL')}
              </Typography>
            </Box>

            <Divider sx={{ bgcolor: '#404040', my: 2 }} />

            {/* LICZBA ROZPRAW */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                LICZBA ROZPRAW
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={fullData.hearings_count || 0}
                  size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff' }}
                />
              </Box>
            </Box>

            {/* LICZBA UCZESTNIKÓW */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#b0b0b0', fontWeight: 'bold' }}>
                LICZBA UCZESTNIKÓW
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={fullData.participants_count || 0}
                  size="small"
                  sx={{ bgcolor: '#388e3c', color: '#fff' }}
                />
              </Box>
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2d2d2d', p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#1976d2',
            color: '#fff',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaseDetailsModal;
