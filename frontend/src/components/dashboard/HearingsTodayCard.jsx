// src/components/dashboard/HearingsTodayCard.jsx
import React, { useState, useMemo } from 'react';
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
  useTheme,
} from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import useHearings from '../../hooks/useHearings';
import HearingDetailsModal from './HearingDetailsModal';
import HearingEditModal from './HearingEditModal';

const HearingsTodayCard = () => {
  const theme = useTheme();
  const { data = [], loading, error, refetch } = useHearings();
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Memoized computation dla dzisiejszych rozpraw
  const todayHearings = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    const today = new Date().toISOString().split('T')[0];
    return data.filter((hearing) => {
      try {
        return hearing.date_time && hearing.date_time.startsWith(today);
      } catch {
        return false;
      }
    });
  }, [data]);

  const handleViewDetails = (hearing) => {
    setSelectedHearing(hearing);
    setDetailsModalOpen(true);
  };

  const handleEditHearing = (hearing) => {
    setSelectedHearing(hearing);
    setEditModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedHearing(null);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setSelectedHearing(null);
  };

  const handleEditSuccess = async () => {
    await refetch();
    handleCloseEdit();
  };

  // Loading state
  if (loading) {
    return (
      <Card
        sx={{
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          transition: 'all 0.3s ease',
        }}
      >
        <CircularProgress color="inherit" />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        sx={{
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          p: 2,
          transition: 'all 0.3s ease',
        }}
      >
        <Alert severity="error" sx={{ mb: 0 }}>
          Błąd: {error}
        </Alert>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <CardHeader
  title="📅 Rozprawy dzisiaj"
  subheader={`${todayHearings.length} rozpraw zaplanowanych`}
  titleTypographyProps={{
    variant: 'h6',
    sx: {
      color: theme.palette.text.primary,
      fontWeight: '600',
    },
  }}
  subheaderTypographyProps={{
    sx: {
      color: theme.palette.text.secondary,
    },
  }}
  sx={{
    borderBottom: `1px solid ${theme.palette.divider}`,
  }}
/>
        
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.02)'
                    : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <TableRow>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Godzina
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Sprawa
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Sędzia
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Sala
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
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
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.04)'
                            : 'rgba(255, 255, 255, 0.08)',
                      },
                      borderColor: theme.palette.divider,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: '600',
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {hearing.date_time
                        ? new Date(hearing.date_time).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: '600',
                            color: theme.palette.text.primary,
                          }}
                        >
                          {hearing.case_number || 'Brak numeru'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            mt: 0.5,
                            display: 'block',
                          }}
                        >
                          {hearing.notes || 'Brak notatek'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {hearing.judge_username || 'Niezdefiniowany'}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {hearing.location || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      <StatusChip status={hearing.status} />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ borderColor: theme.palette.divider }}
                    >
                      <Tooltip title="Szczegóły">
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => handleViewDetails(hearing)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edycja">
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: `rgba(${theme.palette.mode === 'light' ? '25, 118, 210' : '224, 224, 224'}, 0.1)`,
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => handleEditHearing(hearing)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      textAlign: 'center',
                      color: theme.palette.text.secondary,
                      p: 3,
                      borderColor: theme.palette.divider,
                      fontStyle: 'italic',
                    }}
                  >
                    Brak rozpraw zaplanowanych na dzisiaj
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <HearingDetailsModal
        open={detailsModalOpen}
        hearing={selectedHearing}
        onClose={handleCloseDetails}
      />

      <HearingEditModal
        open={editModalOpen}
        hearing={selectedHearing}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default HearingsTodayCard;
