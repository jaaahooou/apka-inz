import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig.js';
import {
    Box, Paper, Typography, TextField, Button, MenuItem, Alert, CircularProgress, Divider, InputAdornment, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const CreateCasePage = () => {
    // 1. GŁÓWNE DANE SPRAWY
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

    // 2. STRONY POSTĘPOWANIA
    const [parties, setParties] = useState([
        { role: 'Powód', name: '' },
        { role: 'Pozwany', name: '' }
    ]);
    
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const statuses = ['Oczekuje na przydział', 'W toku', 'Oczekuje na rozprawę', 'Zawieszona', 'Zamknięta'];
    const categories = ['Cywilna', 'Karna', 'Rodzinna', 'Pracy', 'Gospodarcza', 'Wykroczeniowa'];
    const partyRoles = ['Powód', 'Pozwany', 'Oskarżony', 'Pokrzywdzony', 'Świadek', 'Prokurator', 'Obrońca', 'Pełnomocnik', 'Kurator'];

    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const response = await API.get('/court/users/?role=Sędzia');
                if (response.data.length === 0) {
                     const responseAlt = await API.get('/court/users/?role=SEDZIA');
                     setJudges(responseAlt.data);
                } else {
                     setJudges(response.data);
                }

            } catch (err) {
                console.error("Błąd pobierania sędziów:", err);
            }
        };
        fetchJudges();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            ...formData,
            parties: parties.filter(p => p.name.trim() !== '')
        };

        try {
            await API.post('/court/cases/', payload);
            setSuccess(`Sprawa ${formData.case_number} została poprawnie zarejestrowana.`);
            
            // Reset formularza
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
            setParties([{ role: 'Powód', name: '' }, { role: 'Pozwany', name: '' }]);
        } catch (err) {
            console.error("Błąd:", err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Błąd zapisu.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, mb: 8 }}>
            <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
                
                {/* NAGŁÓWEK */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2, borderBottom: '2px solid rgba(25, 118, 210, 0.2)', pb: 2 }}>
                    <GavelIcon color="primary" sx={{ fontSize: 42 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="800" color="primary.main">
                            Rejestrator Spraw Sądowych
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Panel Sekretariatu Wydziału
                        </Typography>
                    </Box>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        
                        {/* SEKCJA 1: DANE REJESTROWE */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                        {/* SEKCJA 2: PRZEDMIOT SPRAWY */}
                        <Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                                <TextField
                                    label="Przedmiot Sprawy *"
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

                        {/* SEKCJA 3: STRONY */}
                        <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Strony Postępowania</Typography>
                                <Button startIcon={<PersonAddIcon />} size="small" onClick={addParty}>Dodaj</Button>
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
                                            sx={{ width: '150px' }}
                                        >
                                            {partyRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            label="Nazwa / Imię i Nazwisko"
                                            value={party.name}
                                            onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                        <IconButton onClick={() => removeParty(index)} color="error"><DeleteIcon /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* SEKCJA 4: OPIS */}
                        <TextField
                            label="Opis stanu faktycznego / Notatka urzędowa"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* SUBMIT */}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ py: 2, fontWeight: 'bold' }}
                            endIcon={loading ? <CircularProgress size={24} color="inherit"/> : <SendIcon />}
                        >
                            ZAREJESTRUJ SPRAWĘ
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateCasePage;