// src/components/HearingEditModal.jsx
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
  useTheme,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import API from '../../api/axiosConfig';

const HearingEditModal = ({ open, hearing, onClose, onSuccess }) => {
  const theme = useTheme();
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

      const response = await API.patch(`/court/hearings/${hearing.id}/update/`, dataToSend);

      setSuccess(true);

      setTimeout(() => {
        onSuccess?.(response.data);
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

  const selectedJudge = judges.find((judge) => judge.id === formData.judge) || null;

  // Dynamiczny sx dla TextField
  const textFieldSx = {
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
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
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
          ✏️ Edytuj rozprawę
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
                sx: textFieldSx,
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
            sx={textFieldSx}
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
            sx={textFieldSx}
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
                sx={textFieldSx}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingJudges ? (
                        <CircularProgress
                          color="inherit"
                          size={20}
                          sx={{ mr: 1 }}
                        />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-popupIndicator': {
                color: theme.palette.text.secondary,
              },
              '& .MuiAutocomplete-clearIndicator': {
                color: theme.palette.text.secondary,
              },
            }}
            PopperComponent={(props) => (
              <Box
                {...props}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                  '& .MuiAutocomplete-listbox': {
                    backgroundColor: theme.palette.background.paper,
                    '& .MuiAutocomplete-option': {
                      backgroundColor: theme.palette.background.paper,
                      '&[aria-selected="true"]': {
                        backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.2)`,
                      },
                      '&:hover': {
                        backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
                      },
                    },
                  },
                }}
              />
            )}
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
            sx={textFieldSx}
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
    </LocalizationProvider>
  );
};

export default HearingEditModal;
