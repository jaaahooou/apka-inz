import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AddEventDialog = ({
  open,
  onClose,
  onSave,
  selectedDate,
  monthName,
  newEvent,
  onEventChange,
  cases = [] // Lista spraw przekazana z rodzica
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
          fontWeight: 700,
        }}
      >
        Nowa rozprawa - {selectedDate ? `${selectedDate} ${monthName}` : ''}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Wybór sprawy zamiast wpisywania tytułu */}
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel>Wybierz sprawę</InputLabel>
          <Select
            value={newEvent.case || ''}
            onChange={(e) => onEventChange('case', e.target.value)}
            label="Wybierz sprawę"
          >
            {cases.length > 0 ? (
              cases.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.case_number} - {c.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                Brak dostępnych spraw
              </MenuItem>
            )}
          </Select>
          {cases.length === 0 && <FormHelperText>Musisz najpierw utworzyć sprawę.</FormHelperText>}
        </FormControl>

        {/* Lokalizacja (wymagana przez backend) */}
        <TextField
          fullWidth
          label="Lokalizacja / Sala"
          placeholder="np. Sala 102, Sąd Rejonowy"
          value={newEvent.location || ''}
          onChange={(e) => onEventChange('location', e.target.value)}
          size="small"
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Godzina"
          type="time"
          value={newEvent.time}
          onChange={(e) => onEventChange('time', e.target.value)}
          size="small"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />

        {/* Status rozprawy */}
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={newEvent.status || 'zaplanowana'}
            onChange={(e) => onEventChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="zaplanowana">📅 Zaplanowana</MenuItem>
            <MenuItem value="odbyta">✅ Odbyta</MenuItem>
            <MenuItem value="odłożona">❌ Odłożona</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Notatki"
          multiline
          rows={2}
          value={newEvent.notes || ''}
          onChange={(e) => onEventChange('notes', e.target.value)}
          size="small"
          variant="outlined"
        />

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Anuluj</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!newEvent.case || !newEvent.location} // Blokada zapisu bez wymaganych danych
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventDialog;