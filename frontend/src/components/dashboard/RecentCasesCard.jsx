// src/components/dashboard/RecentCasesCard.jsx
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
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Divider
} from '@mui/material';
import { OpenInNew as OpenIcon, Edit as EditIcon } from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import useCases from '../../hooks/useCases';
import CaseDetailsModal from './CaseDetailsModal';
import CaseEditModal from './CaseEditModal';

const RecentCasesCard = () => {
  const theme = useTheme();
  const { data = [], loading, error, refetch } = useCases();
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Memoized recent cases
  const recentCases = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return [...data]
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [data]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return 'przed chwilą';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m temu`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h temu`;
      return `${Math.floor(seconds / 86400)}d temu`;
    } catch {
      return 'N/A';
    }
  };

  const handleViewDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setDetailsModalOpen(true);
  };

  const handleEditCase = (caseItem) => {
    setSelectedCase(caseItem);
    setEditModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedCase(null);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setSelectedCase(null);
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
  title="📋 Ostatnie sprawy"
  subheader={`${recentCases.length} ostatnio edytowanych spraw`}
  titleTypographyProps={{
    variant: 'h6',
    sx: {
      color: theme.palette.text.primary,
      fontWeight: 600,
      lineHeight: 1.3,
    },
  }}
  subheaderTypographyProps={{
    variant: 'body2',
    sx: {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
      mt: 0.5,
    },
  }}

/>
<Divider sx={{ borderColor: theme.palette.divider, m: 0 }} />
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
                  Numer sprawy
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Tytuł
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
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                  align="center"
                >
                  Rozprawy
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                  align="center"
                >
                  Uczestnicy
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Edytowana
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
              {recentCases.length > 0 ? (
                recentCases.map((caseItem) => (
                  <TableRow
                    key={caseItem.id}
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
                      {caseItem.case_number || 'N/A'}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        maxWidth: '200px',
                      }}
                    >
                      <Tooltip title={caseItem.title || 'Brak tytułu'}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {caseItem.title || 'Brak tytułu'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ borderColor: theme.palette.divider }}>
                      <StatusChip status={caseItem.status} />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        textAlign: 'center',
                      }}
                    >
                      <Chip
                        label={caseItem.hearings_count || 0}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                          fontWeight: '500',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        textAlign: 'center',
                      }}
                    >
                      <Chip
                        label={caseItem.participants_count || 0}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.success?.main || '#4caf50',
                          color: '#fff',
                          fontWeight: '500',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {formatTimeAgo(caseItem.updated_at || caseItem.created_at)}
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
                          onClick={() => handleViewDetails(caseItem)}
                        >
                          <OpenIcon fontSize="small" />
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
                          onClick={() => handleEditCase(caseItem)}
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
                    colSpan={7}
                    sx={{
                      textAlign: 'center',
                      color: theme.palette.text.secondary,
                      p: 3,
                      borderColor: theme.palette.divider,
                      fontStyle: 'italic',
                    }}
                  >
                    Brak spraw
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal szczegółów */}
      <CaseDetailsModal
        open={detailsModalOpen}
        caseData={selectedCase}
        onClose={handleCloseDetails}
      />

      {/* Modal edycji */}
      <CaseEditModal
        open={editModalOpen}
        caseData={selectedCase}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default RecentCasesCard;
