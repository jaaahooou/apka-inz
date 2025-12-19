import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig.js';
import {
    Box, Paper, Typography, CircularProgress, Alert, Grid, Divider, Chip, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // Ikona pliku
import DownloadIcon from '@mui/icons-material/Download'; // Ikona pobierania
import DescriptionIcon from '@mui/icons-material/Description';

const CaseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [caseData, setCaseData] = useState(null);
    const [documents, setDocuments] = useState([]); // ✅ Stan na dokumenty
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobieramy równolegle szczegóły sprawy ORAZ listę dokumentów
                const [caseRes, docsRes] = await Promise.all([
                    API.get(`/court/cases/${id}/`),
                    API.get(`/court/cases/${id}/documents/`) // Zakładam, że ten endpoint istnieje w urls.py
                ]);

                setCaseData(caseRes.data);
                setDocuments(docsRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Nie udało się pobrać danych sprawy.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // Funkcja pomocnicza do formatowania rozmiaru pliku
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 5, mx: 'auto', maxWidth: 600 }}>{error}</Alert>;
    if (!caseData) return <Alert severity="warning" sx={{ mt: 5, mx: 'auto', maxWidth: 600 }}>Nie znaleziono sprawy.</Alert>;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Wróć do listy
            </Button>

            <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>Sygnatura Akt</Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            {caseData.case_number}
                        </Typography>
                    </Box>
                    <Chip 
                        label={caseData.status} 
                        color={caseData.status === 'W toku' ? 'success' : 'default'} 
                        variant="filled" 
                        sx={{ fontSize: '1rem', px: 1 }}
                    />
                </Box>

                <Typography variant="h5" gutterBottom fontWeight="500" sx={{ mb: 4 }}>
                    {caseData.title}
                </Typography>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4}>
                    {/* LEWA KOLUMNA */}
                    <Grid item xs={12} md={8}>
                        
                        {/* 1. OPIS SPRAWY */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <GavelIcon fontSize="small" /> Opis Sprawy
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
                                    {caseData.description || "Brak dodatkowego opisu."}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* ✅ 2. AKTA SPRAWY / DOKUMENTY (NOWOŚĆ) */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <DescriptionIcon fontSize="small" /> Akta Sprawy / Dokumenty
                            </Typography>
                            
                            {documents.length > 0 ? (
                                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                                    {documents.map((doc, index) => (
                                        <React.Fragment key={doc.id}>
                                            <ListItem 
                                                secondaryAction={
                                                    <Tooltip title="Pobierz plik">
                                                        <IconButton 
                                                            edge="end" 
                                                            aria-label="download" 
                                                            component="a" 
                                                            href={doc.file_url || doc.file} // URL do pliku z backendu
                                                            target="_blank" // Otwórz w nowym oknie
                                                            download // Sugeruj pobieranie
                                                            color="primary"
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                        <InsertDriveFileIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText 
                                                    primary={doc.title} 
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                Dodano: {new Date(doc.uploaded_at).toLocaleDateString()} 
                                                            </Typography>
                                                            {doc.file_size && ` — ${formatBytes(doc.file_size)}`}
                                                        </>
                                                    } 
                                                />
                                            </ListItem>
                                            {index < documents.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                                    <Typography variant="body2" color="text.secondary">Brak załączonych dokumentów w tej sprawie.</Typography>
                                </Paper>
                            )}
                        </Box>

                        {/* 3. STRONY POSTĘPOWANIA */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <PersonIcon fontSize="small" /> Strony Postępowania
                            </Typography>
                            {caseData.parties && caseData.parties.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {caseData.parties.map((party) => (
                                        <Paper key={party.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography fontWeight="bold">{party.role}:</Typography>
                                            <Typography>{party.name}</Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">Brak zdefiniowanych stron w systemie.</Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* PRAWA KOLUMNA: Metryka */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                                METRYKA SPRAWY
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" display="block" color="text.secondary">Kategoria</Typography>
                                <Chip label={caseData.category || "Nieokreślona"} size="small" sx={{ mt: 0.5 }} />
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" display="block" color="text.secondary">Data Wpływu</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <CalendarTodayIcon fontSize="small" color="action" />
                                    <Typography variant="body1">{caseData.filing_date || "—"}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" display="block" color="text.secondary">Wartość Przedmiotu Sporu (WPS)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <AccountBalanceWalletIcon fontSize="small" color="action" />
                                    <Typography variant="body1" fontWeight="bold">
                                        {caseData.value_amount ? `${caseData.value_amount} PLN` : "—"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">Sędzia Referent</Typography>
                                <Typography variant="body1" fontWeight="500" color="primary">
                                    {caseData.assigned_judge_username || "Nie przypisano"}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default CaseDetailsPage;