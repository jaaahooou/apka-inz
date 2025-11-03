import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import useHearings from '../../hooks/useHearings';

const HearingsTodayCard = () => {
  const { data, loading, error } = useHearings();

  // Filtruj rozprawy na dzisiaj
  const getTodayHearings = () => {
    const today = new Date().toISOString().split('T')[0];
    return data.filter((hearing) => 
      hearing.date_time.startsWith(today)
    );
  };

  const todayHearings = getTodayHearings();

  if (loading) {
    return (
      <Card
        sx={{
          mb: 3,
          backgroundColor: '#2d2d2d',
          color: '#fff',
          border: '1px solid #404040',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          mb: 3,
          backgroundColor: '#2d2d2d',
          color: '#fff',
          border: '1px solid #404040',
          p: 2,
        }}
      >
        <Alert severity="error">
          Błąd: {error}
        </Alert>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        backgroundColor: '#2d2d2d',
        color: '#fff',
        border: '1px solid #404040',
      }}
    >
      <CardHeader
        title="📅 Rozprawy dzisiaj"
        subheader={`${todayHearings.length} rozpraw zaplanowanych`}
        titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
        subheaderTypographyProps={{ sx: { color: '#b0b0b0' } }}
      />
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#1f1f1f' }}>
            <TableRow>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Godzina
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Sprawa
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Sędzia
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Sala
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Status
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: '#b0b0b0', borderColor: '#404040' }}
              >
                Akcje
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todayHearings.length > 0 ? (
              todayHearings.map((hearing) => (
                <TableRow
                  key={hearing.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#363636' },
                    borderColor: '#404040',
                  }}
                >
                  <TableCell
                    sx={{
                      color: '#fff',
                      fontWeight: 'bold',
                      borderColor: '#404040',
                    }}
                  >
                    {new Date(hearing.date_time).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell sx={{ borderColor: '#404040' }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: '#fff' }}
                      >
                        {hearing.case_number}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                        {hearing.notes || 'Brak notatek'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#fff', borderColor: '#404040' }}>
                    {hearing.judge_username || 'Niezdefiniowany'}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', borderColor: '#404040' }}>
                    {hearing.location}
                  </TableCell>
                  <TableCell sx={{ borderColor: '#404040' }}>
                    <StatusChip status={hearing.status} />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: '#404040' }}>
                    <Tooltip title="Szczegóły">
                      <IconButton 
                        size="small" 
                        sx={{ color: '#b0b0b0' }}
                        onClick={() => console.log('View:', hearing.id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edycja">
                      <IconButton 
                        size="small" 
                        sx={{ color: '#b0b0b0' }}
                        onClick={() => console.log('Edit:', hearing.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#b0b0b0', p: 3 }}>
                  Brak rozpraw zaplanowanych na dzisiaj
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default HearingsTodayCard;