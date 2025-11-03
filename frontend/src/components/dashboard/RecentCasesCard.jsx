import React, { useState } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { OpenInNew as OpenIcon, Edit as EditIcon } from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import useCases from '../../hooks/useCases'; // ← Nowy hook

const RecentCasesCard = () => {
  const { data, loading, error } = useCases();

  // Sortuj po dacie edycji i weź ostatnie 10
  const recentCases = [...data]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 10);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'przed chwilą';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m temu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h temu`;
    return `${Math.floor(seconds / 86400)}d temu`;
  };

  if (loading) {
    return (
      <Card sx={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #404040', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #404040', p: 2 }}>
        <Alert severity="error">Błąd: {error}</Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #404040' }}>
      <CardHeader
        title="📋 Ostatnie sprawy"
        subheader={`${recentCases.length} ostatnio edytowanych spraw`}
        titleTypographyProps={{ variant: 'h6', sx: { color: '#fff' } }}
        subheaderTypographyProps={{ sx: { color: '#b0b0b0' } }}
      />
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#1f1f1f' }}>
            <TableRow>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Numer sprawy
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Tytuł
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Status
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }} align="center">
                Rozprawy
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }} align="center">
                Uczestnicy
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Edytowana
              </TableCell>
              <TableCell align="right" sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                Akcje
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentCases.length > 0 ? (
              recentCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#363636' },
                    borderColor: '#404040',
                  }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: '#404040' }}>
                    {caseItem.case_number}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', borderColor: '#404040', maxWidth: '300px' }}>
                    <Tooltip title={caseItem.title}>
                      <Typography 
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {caseItem.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#404040' }}>
                    <StatusChip status={caseItem.status} />
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', borderColor: '#404040', textAlign: 'center' }}
                  >
                    <Chip
                      label={caseItem.hearings_count || 0}
                      size="small"
                      sx={{ 
                        bgcolor: '#1976d2',
                        color: '#fff',
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', borderColor: '#404040', textAlign: 'center' }}
                  >
                    <Chip
                      label={caseItem.participants_count || 0}
                      size="small"
                      sx={{ 
                        bgcolor: '#388e3c',
                        color: '#fff',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#b0b0b0', borderColor: '#404040' }}>
                    {formatTimeAgo(caseItem.updated_at || caseItem.created_at)}
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: '#404040' }}>
                    <Tooltip title="Otwórz">
                      <IconButton 
                        size="small" 
                        sx={{ color: '#b0b0b0' }}
                        onClick={() => {
                          // Możesz dodać nawigację do szczegółów sprawy
                          console.log('Otwórz sprawę:', caseItem.id);
                        }}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edycja">
                      <IconButton 
                        size="small" 
                        sx={{ color: '#b0b0b0' }}
                        onClick={() => {
                          console.log('Edytuj sprawę:', caseItem.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', color: '#b0b0b0', p: 3 }}>
                  Brak spraw
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default RecentCasesCard;
