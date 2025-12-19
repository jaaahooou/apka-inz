import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Alert,
    TextField,
    InputAdornment,
    TablePagination,
    TableSortLabel,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import SearchIcon from '@mui/icons-material/Search';
import ArchiveIcon from '@mui/icons-material/Archive';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const JudgeDocket = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // --- STANY DANYCH ---
    const [allHearings, setAllHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STANY UI ---
    const [viewMode, setViewMode] = useState('current');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('date_time');
    const [order, setOrder] = useState('asc');

    // Używamy useCallback, aby funkcja była stabilna i nie powodowała pętli w useEffect
    const fetchHearings = useCallback(async () => {
        try {
            const response = await API.get('/court/hearings/');
            
            const myHearings = response.data.filter(hearing => {
                if (typeof hearing.judge === 'number') {
                    return hearing.judge_username === user.username;
                }
                return hearing.judge_username === user.username;
            });

            setAllHearings(myHearings);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania wokandy:", err);
            setError("Nie udało się pobrać listy rozpraw.");
            setLoading(false);
        }
    }, [user.username]); // Zależność od użytkownika

    useEffect(() => {
        fetchHearings();
    }, [fetchHearings]); // Dodano fetchHearings do zależności

    // --- FILTROWANIE I SORTOWANIE ---
    
    // Funkcje filtrujące opakowane w useCallback
    const filterByStatus = useCallback((hearing) => {
        if (viewMode === 'archive') {
            return hearing.status === 'odbyta';
        } else {
            return hearing.status !== 'odbyta';
        }
    }, [viewMode]);

    const filterBySearch = useCallback((hearing) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            hearing.case_number.toLowerCase().includes(term) ||
            hearing.location.toLowerCase().includes(term) ||
            (hearing.notes && hearing.notes.toLowerCase().includes(term))
        );
    }, [searchTerm]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // useMemo z poprawnymi zależnościami
    const sortedAndFilteredHearings = useMemo(() => {
        return allHearings
            .filter(filterByStatus)
            .filter(filterBySearch)
            .sort((a, b) => {
                let valA = a[orderBy];
                let valB = b[orderBy];

                if (orderBy === 'date_time') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                } else {
                    valA = (valA || '').toString().toLowerCase();
                    valB = (valB || '').toString().toLowerCase();
                }

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
    }, [allHearings, filterByStatus, filterBySearch, orderBy, order]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewMode(newView);
            setPage(0);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'zaplanowana': return <Chip label="Zaplanowana" color="primary" variant="outlined" size="small" />;
            case 'odbyta': return <Chip label="Zakończona" color="default" size="small" />;
            case 'odłożona': return <Chip label="Odroczona" color="warning" size="small" />;
            case 'w_toku': return <Chip label="W toku" color="success" size="small" />;
            default: return <Chip label={status} size="small" />;
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 3 }}>
            {/* NAGŁÓWEK */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GavelIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                            Moja Wokanda
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sędzia: <strong>{user?.username}</strong>
                        </Typography>
                    </Box>
                </Box>

                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    color="primary"
                    size="small"
                >
                    <ToggleButton value="current" sx={{ px: 3 }}>
                        <EventAvailableIcon sx={{ mr: 1 }} /> Bieżące
                    </ToggleButton>
                    <ToggleButton value="archive" sx={{ px: 3 }}>
                        <ArchiveIcon sx={{ mr: 1 }} /> Archiwum
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            
            {/* FILTRY */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.default' }}>
                <TextField 
                    size="small" 
                    placeholder="Szukaj (sygnatura, sala, notatki)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1, minWidth: 300, flexGrow: 1 }}
                />
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* TABELA */}
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'date_time' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'date_time'}
                                    direction={orderBy === 'date_time' ? order : 'asc'}
                                    onClick={() => handleRequestSort('date_time')}
                                >
                                    <strong>Data i Godzina</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'case_number' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'case_number'}
                                    direction={orderBy === 'case_number' ? order : 'asc'}
                                    onClick={() => handleRequestSort('case_number')}
                                >
                                    <strong>Sygnatura Sprawy</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'location' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'location'}
                                    direction={orderBy === 'location' ? order : 'asc'}
                                    onClick={() => handleRequestSort('location')}
                                >
                                    <strong>Sala</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Notatki</strong></TableCell>
                            <TableCell align="center"><strong>Akcje</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedAndFilteredHearings
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((hearing) => (
                                <TableRow key={hearing.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon color="action" fontSize="small" />
                                            {new Date(hearing.date_time).toLocaleString('pl-PL', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold" color="primary.main">
                                            {hearing.case_number}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{hearing.location}</TableCell>
                                    <TableCell>{getStatusChip(hearing.status)}</TableCell>
                                    
                                    {/* ✅ POPRAWKA: Usunięto 'noWrap' z TableCell i przeniesiono do Typography */}
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {hearing.notes || "—"}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => navigate(`/cases/${hearing.case}`)}
                                            sx={{ borderRadius: 20, textTransform: 'none' }}
                                        >
                                            Akta
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        
                        {sortedAndFilteredHearings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {viewMode === 'current' 
                                            ? "Brak zaplanowanych rozpraw." 
                                            : "Brak zarchiwizowanych rozpraw."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={sortedAndFilteredHearings.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Wierszy na stronę:"
                />
            </TableContainer>
        </Box>
    );
};

export default JudgeDocket;