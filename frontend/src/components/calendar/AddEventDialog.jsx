// src/components/calendar/AddEventDialog.jsx
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
  eventColors,
  eventLabels,
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
        Add Event - {selectedDate ? `${selectedDate} ${monthName}` : ''}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          fullWidth
          label="Event Title"
          placeholder="Enter event title"
          value={newEvent.title}
          onChange={(e) => onEventChange('title', e.target.value)}
          size="small"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Time"
          type="time"
          value={newEvent.time}
          onChange={(e) => onEventChange('time', e.target.value)}
          size="small"
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={newEvent.type}
            onChange={(e) => onEventChange('type', e.target.value)}
            label="Type"
          >
            {Object.keys(eventColors).map((type) => (
              <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                {eventLabels[type]} {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventDialog;
