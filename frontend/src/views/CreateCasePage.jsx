import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    InputAdornment,
    IconButton,
    Snackbar,
    FormControlLabel,
    Switch,
    Fade,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import EventIcon from '@mui/icons-material/Event';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const CreateCasePage = () => {
    
    const [formData, setFormData] = useState({
        case_number: '',
        title: '',
        status: 'Oczekuje na przydział',
        assigned_judge: '', 
        description: '',
        filing_date: new Date().toISOString().split('T')[0],
        category: 'Cywilna',
        value_amount: ''
    });

    
    const [scheduleHearing, setScheduleHearing] = useState(false);
    const [hearingData, setHearingData] = useState({
        date_time: '',
        location: ''
    });

    
    const [parties, setParties] = useState([
        { role: 'Powód', name: '' },
        { role: 'Pozwany', name: '' }
    ]);

    
    const [files, setFiles] = useState([]);
    
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(false);
    
    
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const statuses = ['Oczekuje na przydział', 'W toku', 'Oczekuje na rozprawę', 'Zawieszona', 'Zamknięta'];
    const categories = ['Cywilna', 'Karna', 'Rodzinna', 'Pracy', 'Gospodarcza', 'Wykroczeniowa'];
    const partyRoles = ['Powód', 'Pozwany', 'Oskarżony', 'Pokrzywdzony', 'Świadek', 'Prokurator', 'Obrońca', 'Pełnomocnik', 'Kurator'];

    
    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const [usersRes, rolesRes] = await Promise.all([
                    API.get('/court/users/'),
                    API.get('/court/roles/')
                ]);

                const users = usersRes.data;
                const roles = rolesRes.data;

                const judgeRoleIds = roles
                    .filter(r => ['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(r.name))
                    .map(r => r.id);

                const judgesList = users.filter(u => {
                    if (u.role && judgeRoleIds.includes(u.role)) return true;
                    if (u.role_name && ['Sędzia', 'SEDZIA', 'Sedzia', 'Sędzina'].includes(u.role_name)) return true;
                    return false;
                });

                setJudges(judgesList);
            } catch (err) {
                console.error("Błąd pobierania danych:", err);
                showSnackbar("Nie udało się pobrać listy sędziów.", "warning");
            }
        };
        fetchJudges();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHearingChange = (e) => {
        setHearingData({ ...hearingData, [e.target.name]: e.target.value });
    };

    const handlePartyChange = (index, field, value) => {
        const newParties = [...parties];
        newParties[index][field] = value;
        setParties(newParties);
    };

    const addParty = () => {
        setParties([...parties, { role: 'Świadek', name: '' }]);
    };

    const removeParty = (index) => {
        const newParties = parties.filter((_, i) => i !== index);
        setParties(newParties);
    };

    
    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleReset = () => {
        if (window.confirm("Czy na pewno chcesz wyczyścić formularz?")) {
            resetAllFields();
        }
    };

    const resetAllFields = () => {
        setFormData({
            case_number: '',
            title: '',
            status: 'Oczekuje na przydział',
            assigned_judge: '',
            description: '',
            filing_date: new Date().toISOString().split('T')[0],
            category: 'Cywilna',
            value_amount: ''
        });
        setHearingData({ date_time: '', location: '' });
        setScheduleHearing(false);
        setParties([{ role: 'Powód', name: '' }, { role: 'Pozwany', name: '' }]);
        setFiles([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            parties: parties.filter(p => p.name.trim() !== '')
        };

        
        if (scheduleHearing && hearingData.date_time && hearingData.location) {
            payload.status = 'Oczekuje na rozprawę';
        }

        try {
            
            const response = await API.post('/court/cases/', payload);
            const newCaseId = response.data.id;
            
            let message = `Sprawa ${formData.case_number} została pomyślnie zarejestrowana!`;

            
            if (scheduleHearing && hearingData.date_time && hearingData.location) {
                const hearingPayload = {
                    case: newCaseId,
                    date_time: hearingData.date_time,
                    location: hearingData.location,
                    judge: formData.assigned_judge || null,
                    notes: 'Pierwszy termin wyznaczony przy rejestracji sprawy.'
                };
                
                await API.post('/court/hearings/', hearingPayload);
                message += " Wyznaczono również pierwszy termin rozprawy.";
            }

            
            if (files.length > 0) {
                const uploadPromises = files.map(file => {
                    const fileFormData = new FormData();
                    fileFormData.append('file', file);
                    fileFormData.append('title', file.name); 
                    fileFormData.append('case', newCaseId);
                    fileFormData.append('description', 'Dokument dodany podczas rejestracji sprawy');
                    
                    return API.post('/court/documents/', fileFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                });

                await Promise.all(uploadPromises);
                message += ` Dodano ${files.length} dokumentów do akt.`;
            }
            
            showSnackbar(message, 'success');
            resetAllFields();

        } catch (err) {
            console.error("Błąd:", err);
            let errorMsg = "Wystąpił błąd podczas zapisu.";
            if (err.response?.data) {
                if (err.response.data.case_number) errorMsg = "Ta sygnatura akt już istnieje!";
                else errorMsg = JSON.stringify(err.response.data);
            }
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    
    const openDatePicker = (e) => {
        try {
            if(e.target.showPicker) {
                e.target.showPicker();
            }
        } catch (error) {
            
        }
    };

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, mb: 8 }}>
            <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
                
                {/* NAGŁÓWEK */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid rgba(25, 118, 210, 0.2)', pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <GavelIcon color="primary" sx={{ fontSize: 42 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="800" color="primary.main">
                                Rejestrator Spraw
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Panel Sekretariatu Wydziału
                            </Typography>
                        </Box>
                    </Box>
                    <Button 
                        startIcon={<CleaningServicesIcon />} 
                        color="secondary" 
                        onClick={handleReset}
                        size="small"
                    >
                        Wyczyść
                    </Button>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        
                        {/* SEKCJA 1: DANE REJESTROWE */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                <AccountBalanceIcon fontSize="small" /> Dane Rejestrowe
                            </Typography>
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, 
                                gap: 2 
                            }}>
                                <TextField
                                    label="Sygnatura Akt *"
                                    name="case_number"
                                    value={formData.case_number}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="np. I C 123/24"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    select
                                    label="Kategoria"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                >
                                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </TextField>
                                <TextField
                                    type="date"
                                    label="Data wpływu"
                                    name="filing_date"
                                    value={formData.filing_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ max: "2100-12-31" }}
                                    onClick={openDatePicker}
                                />
                                
                                <TextField
                                    select
                                    label="Sędzia Referent"
                                    name="assigned_judge"
                                    value={formData.assigned_judge}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    SelectProps={{ displayEmpty: true }}
                                >
                                    <MenuItem value=""><em style={{opacity:0.6}}>Wybierz później</em></MenuItem>
                                    {judges.length > 0 ? (
                                        judges.map(j => (
                                            <MenuItem key={j.id} value={j.id}>
                                                {j.first_name} {j.last_name} ({j.username})
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>Brak sędziów w bazie</MenuItem>
                                    )}
                                </TextField>
                            </Box>
                        </Box>

                        <Divider />

                        {/* SEKCJA 2: PIERWSZY TERMIN (ROZPRAWA) */}
                        <Box sx={{ bgcolor: scheduleHearing ? 'rgba(25, 118, 210, 0.05)' : 'transparent', p: 2, borderRadius: 2, border: scheduleHearing ? '1px solid rgba(25, 118, 210, 0.3)' : 'none', transition: 'all 0.3s' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={scheduleHearing}
                                        onChange={(e) => setScheduleHearing(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: scheduleHearing ? 'primary.main' : 'text.secondary' }}>
                                        <EventIcon fontSize="small" /> Wyznacz pierwszy termin rozprawy
                                    </Typography>
                                }
                            />
                            
                            <Fade in={scheduleHearing}>
                                <Box sx={{ mt: 2, display: scheduleHearing ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        label="Data i Godzina Rozprawy *"
                                        type="datetime-local"
                                        name="date_time"
                                        value={hearingData.date_time}
                                        onChange={handleHearingChange}
                                        InputLabelProps={{ shrink: true }}
                                        required={scheduleHearing} 
                                        sx={{ bgcolor: 'background.paper' }}
                                        inputProps={{ max: "2100-12-31T23:59" }}
                                        onClick={openDatePicker}
                                    />
                                    <TextField
                                        label="Sala Rozpraw / Lokalizacja *"
                                        name="location"
                                        value={hearingData.location}
                                        onChange={handleHearingChange}
                                        placeholder="np. Sala 102"
                                        required={scheduleHearing}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                </Box>
                            </Fade>
                        </Box>

                        <Divider />

                        {/* SEKCJA 3: PRZEDMIOT SPRAWY */}
                        <Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                                <TextField
                                    label="Przedmiot Sprawy (Tytuł) *"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="WPS (PLN)"
                                    name="value_amount"
                                    type="number"
                                    value={formData.value_amount}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ endAdornment: <InputAdornment position="end">PLN</InputAdornment> }}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        {/* SEKCJA 4: STRONY */}
                        <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Strony Postępowania</Typography>
                                <Button startIcon={<PersonAddIcon />} size="small" variant="outlined" onClick={addParty}>Dodaj Uczestnika</Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {parties.map((party, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            select
                                            label="Rola"
                                            value={party.role}
                                            onChange={(e) => handlePartyChange(index, 'role', e.target.value)}
                                            size="small"
                                            sx={{ width: '180px', bgcolor: 'background.paper' }}
                                        >
                                            {partyRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            label="Nazwa / Imię i Nazwisko"
                                            value={party.name}
                                            onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                                            size="small"
                                            fullWidth
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                        <IconButton onClick={() => removeParty(index)} color="error" disabled={parties.length <= 1}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Divider />

                        {/* SEKCJA 5: ZAŁĄCZNIKI / AKTA SPRAWY  */}
                        <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CloudUploadIcon /> Załączniki / Akta Sprawy
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    size="small"
                                >
                                    Dodaj Dokumenty
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </Box>
                            
                            {files.length > 0 ? (
                                <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                    {files.map((file, index) => (
                                        <ListItem key={index} divider={index !== files.length - 1}>
                                            <InsertDriveFileIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                            <ListItemText 
                                                primary={file.name} 
                                                secondary={`${(file.size / 1024).toFixed(1)} KB`} 
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(index)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic" align="center">
                                    Brak dodanych dokumentów.
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            label="Opis stanu faktycznego / Notatka urzędowa"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            InputLabelProps={{ shrink: true }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ py: 2, fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: 1 }}
                            endIcon={loading ? <CircularProgress size={24} color="inherit"/> : <SendIcon />}
                        >
                            {loading ? 'PRZETWARZANIE...' : 'ZAREJESTRUJ NOWĄ SPRAWĘ'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontSize: '1rem' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateCasePage;