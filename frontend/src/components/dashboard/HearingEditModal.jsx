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
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import API from '../../api/axiosConfig';

const HearingEditModal = ({ open, hearing, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date_time: null,
    location: '',
    status: '',
    notes: '',
    judge: null,
  });
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingJudges, setLoadingJudges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pobierz listę sędziów
  useEffect(() => {
    if (open) {
      fetchJudges();
    }
  }, [open]);

  // Wypełnij formularz danymi rozprawy
  useEffect(() => {
    if (open && hearing) {
      setFormData({
        date_time: hearing.date_time ? dayjs(hearing.date_time) : null,
        location: hearing.location || '',
        status: hearing.status || '',
        notes: hearing.notes || '',
        judge: hearing.judge || null,
      });
      setError(null);
      setSuccess(false);
    }
  }, [open, hearing]);

  const fetchJudges = async () => {
    try {
      setLoadingJudges(true);
      const response = await API.get('/court/users/');
      // Filtruj tylko użytkowników z rolą sędziego (jeśli masz pole role)
      // lub pobierz wszystkich i filtruj po stronie backendu
      setJudges(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania sędziów:', err);
    } finally {
      setLoadingJudges(false);
    }
  };

  const handleDateChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      date_time: newValue,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJudgeChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      judge: newValue ? newValue.id : null,
    }));
  };

 const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.date_time || !formData.location || !formData.status) {
      setError('Data, godzina, sala i status są wymagane');
      setLoading(false);
      return;
    }

    const dataToSend = {
      date_time: formData.date_time.format('YYYY-MM-DDTHH:mm:ss'),
      location: formData.location,
      status: formData.status,
      notes: formData.notes,
      judge: formData.judge,
    };

    // Wykonaj PATCH
    const response = await API.patch(`/court/hearings/${hearing.id}/update/`, dataToSend);

    setSuccess(true);
    
    // ✅ Odśwież dane i zamknij modal
    setTimeout(() => {
      onSuccess?.(response.data); // Przekaż zaktualizowane dane
      onClose();
    }, 1500);
  } catch (err) {
    setError(
      err.response?.data?.detail ||
      err.response?.data?.message ||
      'Nie udało się zaktualizować rozprawy'
    );
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  if (!hearing) return null;

  // Znajdź aktualnie wybranego sędziego
  const selectedJudge = judges.find((judge) => judge.id === formData.judge) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2d2d2d', color: '#fff', fontWeight: 'bold' }}>
          ✏️ Edytuj rozprawę
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Rozprawa została zaktualizowana!
            </Alert>
          )}

          {/* Data i godzina z DateTimePicker */}
          <DateTimePicker
            label="Data i godzina"
            value={formData.date_time}
            onChange={handleDateChange}
            disabled={loading}
            ampm={false}
            format="DD.MM.YYYY HH:mm"
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#404040' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                  },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiSvgIcon-root': { color: '#b0b0b0' },
                },
              },
            }}
          />

          {/* Sala */}
          <TextField
            fullWidth
            label="Sala sądowa"
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
            margin="normal"
            placeholder="np. Sala 5"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#404040' },
                '&:hover fieldset': { borderColor: '#1976d2' },
              },
              '& .MuiInputLabel-root': { color: '#b0b0b0' },
              '& .MuiInputBase-input::placeholder': {
                color: '#b0b0b0',
                opacity: 1,
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
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#404040' },
                '&:hover fieldset': { borderColor: '#1976d2' },
              },
              '& .MuiInputLabel-root': { color: '#b0b0b0' },
            }}
          >
            <MenuItem value="zaplanowana">📋 Zaplanowana</MenuItem>
            <MenuItem value="odbyta">✅ Odbyta</MenuItem>
            <MenuItem value="odłożona">⏸️ Odłożona</MenuItem>
          </TextField>

          {/* Sędzia z Autocomplete */}
          <Autocomplete
            fullWidth
            options={judges}
            getOptionLabel={(option) => 
              `${option.first_name} ${option.last_name} (${option.email})`
            }
            value={selectedJudge}
            onChange={handleJudgeChange}
            disabled={loading || loadingJudges}
            loading={loadingJudges}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sędzia prowadzący"
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#404040' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                  },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiSvgIcon-root': { color: '#b0b0b0' },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingJudges ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-popupIndicator': { color: '#b0b0b0' },
              '& .MuiAutocomplete-clearIndicator': { color: '#b0b0b0' },
            }}
          />

          {/* Notatki */}
          <TextField
            fullWidth
            label="Notatki"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={loading}
            margin="normal"
            multiline
            rows={4}
            placeholder="Dodaj notatki dotyczące rozprawy..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#404040' },
                '&:hover fieldset': { borderColor: '#1976d2' },
              },
              '& .MuiInputLabel-root': { color: '#b0b0b0' },
              '& .MuiInputBase-input::placeholder': {
                color: '#b0b0b0',
                opacity: 1,
              },
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
    </LocalizationProvider>
  );
};

export default HearingEditModal;
