import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
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
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    InputAdornment,
    TablePagination,
    TableSortLabel,
    Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const AdminCasesPage = () => {
    const [cases, setCases] = useState([]);
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Stan edycji
    const [editOpen, setEditOpen] = useState(false);
    const [currentCase, setCurrentCase] = useState(null);
    const [editFormData, setEditFormData] = useState({
        case_number: '',
        title: '',
        status: '',
        assigned_judge: ''
    });

    // Stan tabeli (Paginacja, Sortowanie, Szukanie)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const statuses = ['Oczekuje na przydział', 'W toku', 'Oczekuje na rozprawę', 'Zawieszona', 'Zamknięta'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [casesRes, usersRes, rolesRes] = await Promise.all([
                API.get('/court/cases/'),
                API.get('/court/users/'),
                API.get('/court/roles/')
            ]);

            setCases(casesRes.data);
            
            const allUsers = usersRes.data;
            const allRoles = rolesRes.data;

            const judgeRoleIds = allRoles
                .filter(r => ['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(r.name))
                .map(r => r.id);

            const judgesList = allUsers.filter(u => {
                if (u.role && judgeRoleIds.includes(u.role)) return true;
                if (u.role_name && ['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(u.role_name)) return true;
                return false;
            });
            
            setJudges(judgesList);
            setLoading(false);
        } catch (err) {
            console.error("Błąd:", err);
            setError("Nie udało się pobrać danych.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Obsługa tabeli (Sortowanie i Paginacja)
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Logika filtrowania i sortowania
    const filteredCases = cases.filter(c => 
        c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.assigned_judge_username && c.assigned_judge_username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedCases = filteredCases.sort((a, b) => {
        // Obsługa sortowania dat
        if (orderBy === 'created_at') {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (order === 'asc') {
            return a[orderBy] < b[orderBy] ? -1 : 1;
        } else {
            return a[orderBy] > b[orderBy] ? -1 : 1;
        }
    });

    // 3. Edycja
    const handleEditClick = (caseItem) => {
        setCurrentCase(caseItem);
        setEditFormData({
            case_number: caseItem.case_number,
            title: caseItem.title,
            status: caseItem.status,
            assigned_judge: caseItem.assigned_judge ? caseItem.assigned_judge : '' 
        });
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await API.patch(`/court/cases/${currentCase.id}/`, editFormData);
            setEditOpen(false);
            fetchData();
            showSnackbar('Sprawa została zaktualizowana pomyślnie!', 'success');
        } catch (err) {
            showSnackbar('Nie udało się zapisać zmian. Sprawdź poprawność danych.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Czy na pewno chcesz bezpowrotnie usunąć tę sprawę?")) {
            try {
                await API.delete(`/court/cases/${id}/`);
                setCases(cases.filter(c => c.id !== id));
                showSnackbar('Sprawa została usunięta.', 'info');
            } catch (err) {
                showSnackbar('Błąd podczas usuwania sprawy.', 'error');
            }
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'W toku': return 'primary';
            case 'Zamknięta': return 'default'; // Szary
            case 'Zawieszona': return 'error'; // Czerwony
            case 'Oczekuje na przydział': return 'warning'; // Pomarańczowy
            case 'Oczekuje na rozprawę': return 'info'; // Jasny niebieski
            default: return 'default';
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    <GavelIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Administracja Sprawami
                </Typography>
                
                {/* WYSZUKIWARKA */}
                <TextField
                    placeholder="Szukaj (sygnatura, tytuł, sędzia)..."
                    size="small"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ bgcolor: 'background.paper', width: 300 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'id' ? order : false}>
                                <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleRequestSort('id')}>ID</TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'created_at' ? order : false}>
                                <TableSortLabel active={orderBy === 'created_at'} direction={orderBy === 'created_at' ? order : 'asc'} onClick={() => handleRequestSort('created_at')}>Data Rejestracji</TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'case_number' ? order : false}>
                                <TableSortLabel active={orderBy === 'case_number'} direction={orderBy === 'case_number' ? order : 'asc'} onClick={() => handleRequestSort('case_number')}>Sygnatura</TableSortLabel>
                            </TableCell>
                            <TableCell>Tytuł</TableCell>
                            <TableCell sortDirection={orderBy === 'status' ? order : false}>
                                <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>Status</TableSortLabel>
                            </TableCell>
                            <TableCell>Sędzia Referent</TableCell>
                            <TableCell align="center">Akcje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCases
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon fontSize="small" color="action" />
                                        {new Date(row.created_at).toLocaleDateString('pl-PL')}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.case_number}</TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={row.status} 
                                        size="small" 
                                        variant="outlined" 
                                        color={getStatusColor(row.status)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {row.assigned_judge_username ? (
                                        <Typography variant="body2" color="primary">
                                            {row.assigned_judge_username}
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">Brak</Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleEditClick(row)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedCases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    Brak wyników dla wpisanej frazy.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                
                {/* PAGINACJA */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={sortedCases.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Wierszy na stronę:"
                />
            </TableContainer>

            {/* OKNO DIALOGOWE EDYCJI */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edycja Sprawy: {currentCase?.case_number}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        
                        <TextField
                            label="Sygnatura Akt"
                            value={editFormData.case_number}
                            onChange={(e) => setEditFormData({ ...editFormData, case_number: e.target.value })}
                            fullWidth
                        />
                        
                        <TextField
                            label="Tytuł Sprawy"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Status Sprawy</InputLabel>
                            <Select
                                value={editFormData.status}
                                label="Status Sprawy"
                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            >
                                {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Zmień Sędziego Referenta</InputLabel>
                            <Select
                                value={editFormData.assigned_judge}
                                label="Zmień Sędziego Referenta"
                                onChange={(e) => setEditFormData({ ...editFormData, assigned_judge: e.target.value })}
                            >
                                <MenuItem value=""><em>Brak przypisania</em></MenuItem>
                                {judges.map(j => (
                                    <MenuItem key={j.id} value={j.id}>
                                        {j.first_name} {j.last_name} ({j.username})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Anuluj</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Zapisz Zmiany</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminCasesPage;