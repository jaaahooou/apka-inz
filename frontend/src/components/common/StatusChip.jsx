import { Chip } from '@mui/material';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'zaplanowana':
        return 'info';
      case 'odbyta':
        return 'success';
      case 'odłożona':
        return 'warning';
      case 'aktywna':
        return 'success';
      case 'zamknięta':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      zaplanowana: 'Zaplanowana',
      odbyta: 'Odbyta',
      odłożona: 'Odłożona',
      aktywna: 'Aktywna',
      zamknięta: 'Zamknięta',
    };
    return labels[status] || status;
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size="small"
      variant="outlined"
    />
  );
};

export default StatusChip;