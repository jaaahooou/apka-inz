import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig.js';
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
    InputAdornment,
    TextField
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

const UserCases = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [casesRes, hearingsRes] = await Promise.all([
                    API.get('/court/cases/'),
                    API.get('/court/hearings/')
                ]);

                const allCases = casesRes.data;
                const allHearings = hearingsRes.data;
                const userRole = user?.role || '';

                let filteredCases = [];

                if (['ADMIN', 'Admin', 'Sekretariat', 'SEKRETARIAT', 'Asystent sędziego', 'asystent sedziego'].includes(userRole)) {
                    filteredCases = allCases;
                } else if (['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(userRole)) {
                    const hearingCaseIds = allHearings
                        .filter(h => h.judge_username === user.username)
                        .map(h => typeof h.case === 'object' ? h.case.id : h.case);

                    filteredCases = allCases.filter(c => 
                        c.assigned_judge_username === user.username ||       
                        hearingCaseIds.includes(c.id) ||      
                        c.creator_username === user.username
                    );
                } else {
                    filteredCases = allCases.filter(c => c.creator_username === user.username);
                }

                filteredCases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setCases(filteredCases);
                setLoading(false);
            } catch (err) {
                console.error("Błąd:", err);
                setError("Nie udało się pobrać listy spraw.");
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const getStatusChip = (status) => {
        const colors = { 
            'W toku': 'primary', 
            'Oczekuje na przydział': 'warning', 
            'Zamknięta': 'default', 
            'Zawieszona': 'error',
            'Oczekuje na rozprawę': 'info'
        };
        return <Chip label={status} color={colors[status] || 'default'} size="small" variant="outlined" />;
    };

    const displayedCases = cases.filter(c => 
        c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FolderIcon color="primary" sx={{ fontSize: 35 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">Twoje Sprawy</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Zalogowano jako: {user?.username} ({user?.role || 'Brak roli'})
                        </Typography>
                    </Box>
                </Box>
                <TextField 
                    size="small" 
                    placeholder="Szukaj..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment> }}
                />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell><strong>Sygnatura</strong></TableCell>
                            <TableCell><strong>Tytuł</strong></TableCell>
                            <TableCell><strong>Sędzia Referent</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Akcje</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedCases.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.case_number}</TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>{row.assigned_judge_username || '-'}</TableCell>
                                <TableCell>{getStatusChip(row.status)}</TableCell>
                                <TableCell align="center">
                                    <Button 
                                        variant="contained" 
                                        size="small" 
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => navigate(`/cases/${row.id}`)}
                                        sx={{ borderRadius: 20, textTransform: 'none' }}
                                    >
                                        Akta
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserCases;