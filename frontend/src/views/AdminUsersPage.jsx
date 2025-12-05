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
    Switch,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // 1. Pobieranie danych (Użytkowników ORAZ Ról)
    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [usersRes, rolesRes] = await Promise.all([
                API.get('/court/users/'),
                API.get('/court/roles/')
            ]);

            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania danych:", err);
            if (!roles.length) {
                 setError("Nie udało się pobrać listy ról z serwera.");
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Akceptacja użytkownika
    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await API.patch(`/court/users/${userId}/update/`, {
                is_active: !currentStatus
            });
            
            setUsers(users.map(user => 
                user.id === userId ? { ...user, is_active: !currentStatus } : user
            ));
            
            showSuccess("Zaktualizowano status użytkownika");
        } catch (err) {
            console.error(err);
            const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : "Błąd połączenia";
            setError(`Błąd: ${errorDetail}`); 
        }
    };

    // 3. Zmiana Roli
    const handleChangeRole = async (userId, newRoleId) => {
        try {
            await API.patch(`/court/users/${userId}/update/`, {
                role: newRoleId
            });

            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRoleId } : user
            ));

            showSuccess("Zmieniono rolę użytkownika");
        } catch (err) {
            console.error(err);
            setError("Błąd podczas zmiany roli.");
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                Zarządzanie Użytkownikami
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell><strong>Użytkownik</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell align="center"><strong>Status (Akceptacja)</strong></TableCell>
                            <TableCell><strong>Rola</strong></TableCell>
                            <TableCell align="center"><strong>Akcje</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2">{user.username}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ({user.first_name} {user.last_name})
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <Switch
                                            checked={user.is_active}
                                            onChange={() => handleToggleActive(user.id, user.is_active)}
                                            color="success"
                                        />
                                    </Box>
                                </TableCell>

                                {/* Lista Ról pobrana dynamicznie z bazy */}
                                <TableCell>
                                    <Select
                                        size="small"
                                        value={user.role || ''}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        sx={{ minWidth: 150 }}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Wybierz rolę...</MenuItem>
                                        {roles.map(role => (
                                            <MenuItem key={role.id} value={role.id}>
                                                {role.name} 
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell align="center">
                                    <IconButton color="error" size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminUsersPage;