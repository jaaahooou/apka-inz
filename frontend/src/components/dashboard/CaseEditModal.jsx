import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import API from '../../api/axiosConfig';

const CaseEditModal = ({ open, caseData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    description: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && caseData) {
      setFormData({
        case_number: caseData.case_number || '',
        title: caseData.title || '',
        description: caseData.description || '',
        status: caseData.status || '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [open, caseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!formData.case_number || !formData.title || !formData.status) {
        setError('Numer sprawy, tytuł i status są wymagane');
        setLoading(false);
        return;
      }

      await API.patch(`/court/cases/${caseData.id}/update/`, formData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Nie udało się zaktualizować sprawy'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2d2d2d', color: '#fff', fontWeight: 'bold' }}>
        ✏️ Edytuj sprawę
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Sprawa została zaktualizowana!
          </Alert>
        )}

        {/* Numer sprawy */}
        <TextField
          fullWidth
          label="Numer sprawy"
          name="case_number"
          value={formData.case_number}
          onChange={handleChange}
          disabled={loading}
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputLabel-root': { color: '#b0b0b0' },
          }}
        />

        {/* Tytuł */}
        <TextField
          fullWidth
          label="Tytuł sprawy"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={loading}
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputLabel-root': { color: '#b0b0b0' },
          }}
        />

        {/* Status */}
        <TextField
          fullWidth
          label="Status"
          name="status"
          select
          value={formData.status}
          onChange={handleChange}
          disabled={loading}
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputLabel-root': { color: '#b0b0b0' },
          }}
        >
          <MenuItem value="aktywna">Aktywna</MenuItem>
          <MenuItem value="wznowiona">Wznowiona</MenuItem>
          <MenuItem value="zawieszena">Zawieszena</MenuItem>
          <MenuItem value="zamknięta">Zamknięta</MenuItem>
        </TextField>

        {/* Opis */}
        <TextField
          fullWidth
          label="Opis sprawy"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          margin="normal"
          multiline
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
            '& .MuiInputLabel-root': { color: '#b0b0b0' },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2d2d2d', p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#b0b0b0',
            '&:hover': { bgcolor: '#363636' },
          }}
        >
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#1976d2',
            color: '#fff',
            '&:hover': { bgcolor: '#1565c0' },
            minWidth: '100px',
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Zapisz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaseEditModal;
