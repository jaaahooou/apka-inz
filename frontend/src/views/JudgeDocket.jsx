import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GavelIcon from '@mui/icons-material/Gavel';

const JudgeDocket = () => {
    const { user } = useAuth();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHearings = async () => {
        try {
            const response = await API.get('/court/hearings/');
            
            const myHearings = response.data.filter(hearing => 
                hearing.judge_username === user.username || hearing.judge === user.id
            );

            myHearings.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

            setHearings(myHearings);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania wokandy:", err);
            setError("Nie udało się pobrać listy rozpraw.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHearings();
    }, []);

    const getStatusChip = (status) => {
        switch (status) {
            case 'zaplanowana': return <Chip label="Zaplanowana" color="primary" variant="outlined" />;
            case 'odbyta': return <Chip label="Zakończona" color="default" />;
            case 'odłożona': return <Chip label="Odroczona" color="warning" />;
            case 'w_toku': return <Chip label="W toku" color="success" />;
            default: return <Chip label={status} />;
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <GavelIcon color="primary" sx={{ fontSize: 35 }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Moja Wokanda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sędzia: {user?.username}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {hearings.length === 0 && !error ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Brak zaplanowanych rozpraw na najbliższy czas.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell><strong>Data i Godzina</strong></TableCell>
                                <TableCell><strong>Sygnatura Sprawy</strong></TableCell>
                                <TableCell><strong>Sala</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Notatki</strong></TableCell>
                                <TableCell align="center"><strong>Akcje</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hearings.map((hearing) => (
                                <TableRow key={hearing.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon color="action" fontSize="small" />
                                            {new Date(hearing.date_time).toLocaleString('pl-PL', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold">{hearing.case_number}</Typography>
                                    </TableCell>
                                    <TableCell>{hearing.location}</TableCell>
                                    <TableCell>{getStatusChip(hearing.status)}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }} noWrap>
                                        {hearing.notes || "—"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            startIcon={<PlayArrowIcon />}
                                            disabled={hearing.status === 'odbyta'}
                                            onClick={() => alert(`Otwieranie protokołu dla sprawy ${hearing.case_number}...`)}
                                        >
                                            Otwórz
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default JudgeDocket;