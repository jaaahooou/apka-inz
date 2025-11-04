// src/components/cases/CaseDetailDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CaseDetailDialog = ({ open, case: caseData, onClose, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = React.useState(caseData || {});

  React.useEffect(() => {
    if (caseData) {
      setFormData(caseData);
    }
  }, [caseData, open]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Szczegóły sprawy: {formData.case_number}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Numer sprawy"
            value={formData.case_number || ''}
            onChange={handleChange('case_number')}
            disabled
            size="small"
          />

          <TextField
            fullWidth
            label="Tytuł sprawy"
            value={formData.title || ''}
            onChange={handleChange('title')}
            size="small"
          />

          <TextField
            fullWidth
            label="Opis"
            value={formData.description || ''}
            onChange={handleChange('description')}
            multiline
            rows={3}
            size="small"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Typ sprawy"
                value={formData.case_type || ''}
                onChange={handleChange('case_type')}
                size="small"
                select
              >
                <MenuItem value="cywilna">Cywilna</MenuItem>
                <MenuItem value="karna">Karna</MenuItem>
                <MenuItem value="administracyjna">Administracyjna</MenuItem>
                <MenuItem value="pracy">Pracy</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status || ''}
                onChange={handleChange('status')}
                size="small"
                select
              >
                <MenuItem value="in_progress">W toku</MenuItem>
                <MenuItem value="resolved">Rozstrzygnięta</MenuItem>
                <MenuItem value="suspended">Zawieszona</MenuItem>
                <MenuItem value="dismissed">Umorzono</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sąd"
                value={formData.court_name || ''}
                onChange={handleChange('court_name')}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sędzia"
                value={formData.judge_name || ''}
                onChange={handleChange('judge_name')}
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data otwarcia"
                type="date"
                value={formData.opened_date ? formData.opened_date.split('T')[0] : ''}
                onChange={handleChange('opened_date')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data zamknięcia"
                type="date"
                value={formData.closed_date ? formData.closed_date.split('T')[0] : ''}
                onChange={handleChange('closed_date')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Notatki"
            value={formData.notes || ''}
            onChange={handleChange('notes')}
            multiline
            rows={3}
            size="small"
          />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaseDetailDialog;
