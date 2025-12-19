import React, { useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useHearings from '../hooks/useHearings'; 
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
    Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';

// Importujemy modal szczegółów sprawy
import CaseDetailsModal from '../components/dashboard/CaseDetailsModal'; 

const JudgeDocket = () => {
    const { user } = useAuth();
    const { data: allHearings, loading, error } = useHearings();
    
    // --- STAN DLA MODALA ---
    const [selectedCase, setSelectedCase] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const myHearings = useMemo(() => {
        if (!allHearings || !user) return [];
        const currentUserId = user.user_id || user.id;
        if (!currentUserId) return [];

        return allHearings.filter(hearing => {
            const judgeId = hearing.judge && (typeof hearing.judge === 'object' ? hearing.judge.id : hearing.judge);
            return String(judgeId) === String(currentUserId);
        }).sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
    }, [allHearings, user]);

    const getStatusChip = (status) => {
        switch (status) {
            case 'zaplanowana': return <Chip label="Zaplanowana" color="primary" variant="outlined" />;
            case 'odbyta': return <Chip label="Zakończona" color="default" />;
            case 'odłożona': return <Chip label="Odroczona" color="warning" />;
            case 'w_toku': return <Chip label="W toku" color="success" />;
            default: return <Chip label={status} />;
        }
    };

    // ZMIANA: Zamiast nawigacji, otwieramy modal
    const handleOpenCase = (caseData) => {
        // caseData może być ID (int) lub obiektem (jeśli serializer zwraca zagnieżdżone dane)
        // CaseDetailsModal zazwyczaj oczekuje całego obiektu sprawy lub ID, które sobie dociągnie.
        // Jeśli mamy tylko ID, przekażemy ID. Jeśli obiekt, to obiekt.
        
        // Sprawdźmy co mamy:
        if (typeof caseData === 'object' && caseData !== null) {
             setSelectedCase(caseData);
        } else {
             // Jeśli mamy tylko ID, tworzymy "tymczasowy" obiekt z samym ID, 
             // licząc na to, że modal sobie poradzi (lub fetchuje po ID).
             // UWAGA: Twoj CaseDetailsModal.jsx (z listy plików) prawdopodobnie przyjmuje obiekt `caseData`.
             // Jeśli useHearings zwraca tylko ID sprawy w polu `case`, 
             // to modal może potrzebować modyfikacji lub musimy tu pobrać sprawę.
             // Zakładam wariant optymistyczny: serializer zwraca obiekt LUB modal fetchuje.
             // Dla bezpieczeństwa przekażmy ID jako obiekt.
             setSelectedCase({ id: caseData });
        }
        setIsDetailsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedCase(null);
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
                        {(user?.user_id || user?.id) && <span style={{opacity: 0.5, marginLeft: 8}}>(ID: {user.user_id || user.id})</span>}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {myHearings.length === 0 && !error ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Brak zaplanowanych rozpraw na najbliższy czas.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        (Upewnij się, że w sprawach jesteś przypisany jako <strong>Sędzia referent</strong>)
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
                            {myHearings.map((hearing) => (
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
                                        <Typography fontWeight="bold" color="primary">
                                            {hearing.case_number || `Sprawa #${typeof hearing.case === 'object' ? hearing.case.id : hearing.case}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{hearing.location}</TableCell>
                                    <TableCell>{getStatusChip(hearing.status)}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }} noWrap>
                                        {hearing.notes || "—"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Przejdź do akt sprawy">
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleOpenCase(hearing.case)}
                                            >
                                                Akta
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* --- MODAL SZCZEGÓŁÓW SPRAWY --- */}
            {selectedCase && (
                <CaseDetailsModal
                    open={isDetailsModalOpen}
                    onClose={handleCloseModal}
                    caseData={selectedCase}
                    // Jeśli CaseDetailsModal wymaga funkcji fetchowania/odświeżania, możesz je tu przekazać
                    // np. onEdit={() => {}} 
                />
            )}
        </Box>
    );
};

export default JudgeDocket;