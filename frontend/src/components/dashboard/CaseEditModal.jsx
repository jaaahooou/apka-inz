// src/components/CaseEditModal.jsx
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
  useTheme,
} from '@mui/material';
import API from '../../api/axiosConfig';

const CaseEditModal = ({ open, caseData, onClose, onSuccess }) => {
  const theme = useTheme();
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
        ✏️ Edytuj sprawę
      </DialogTitle>

      <DialogContent 
        sx={{ 
          bgcolor: theme.palette.background.default, 
          color: theme.palette.text.primary, 
          pt: 3,
        }}
      >
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
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.palette.text.primary,
              '& fieldset': { 
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': { 
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': { 
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
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
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.palette.text.primary,
              '& fieldset': { 
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': { 
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': { 
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
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
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.palette.text.primary,
              '& fieldset': { 
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': { 
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': { 
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
            '& .MuiSvgIcon-root': {
              color: theme.palette.text.secondary,
            },
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
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: theme.palette.text.primary,
              '& fieldset': { 
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': { 
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': { 
              color: theme.palette.text.secondary,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            },
          }}
        />
      </DialogContent>

      <DialogActions 
        sx={{ 
          bgcolor: theme.palette.background.paper, 
          p: 2, 
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': { 
              backgroundColor: `rgba(${theme.palette.mode === 'light' ? '0, 0, 0' : '255, 255, 255'}, 0.08)`,
            },
          }}
        >
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
            fontWeight: '500',
            '&:hover': { 
              backgroundColor: theme.palette.primary.dark,
            },
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
