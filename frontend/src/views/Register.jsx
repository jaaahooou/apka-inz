import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "@fontsource/montserrat/400.css";

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const userData = {
            username: username,
            password: password,
            email: email,
            first_name: name,
            last_name: surname,
            phone: phoneNumber,
            role: null,
            status: "active"
        };

        try {
            const response = await axios.post("http://localhost:8000/court/users/", userData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            navigate("/login");

        } catch (err) {
            console.error("Błąd rejestracji:", err.response?.data || err.message);
            setError(JSON.stringify(err.response?.data) || "Nie udało się zarejestrować użytkownika.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
            }}
        >
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={9}
                sx={{
                    p: 3,
                    width: 500,
                    maxWidth: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                }}
            >
                <Avatar alt="Logo" src="/images/logoApp.png" sx={{ width: 180, height: 180 }} />
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>

                <Typography variant="h5" sx={{ mb: 3 }}>
                    Tworzenie konta
                </Typography>

                <TextField
                    margin="normal"
                    fullWidth
                    label="Nazwa użytkownika"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} required />

                <TextField
                    margin="normal"
                    fullWidth label="Hasło"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} required />

                <TextField
                    margin="normal"
                    fullWidth label="Email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} required />

                <TextField
                    margin="normal"
                    fullWidth label="Imię"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)} />

                <TextField
                    margin="normal"
                    fullWidth
                    label="Nazwisko"
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)} />

                <TextField
                    margin="normal"
                    fullWidth
                    label="Numer telefonu"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                {error && (
                    <Typography color="error" sx={{ mb: 1, mt: 1 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                        bgcolor: '#FFFFFF',
                        color: 'black',
                        fontWeight: 'bold',
                        py: 1,
                        px: 2,
                        mt: 2,
                        borderRadius: '9999px',
                        '&:hover': { bgcolor: '#E6D5D5' },
                        cursor: 'pointer',
                        border: 'none',
                    }}
                >
                    Zarejestruj się
                </Button>

                        <Button
                          fullWidth
                          variant="text"
                          color="primary"
                          sx={{ mt: 4, mb: 2 }}
                          onClick={()=> navigate('/login')}
                        >
                          Posiadam konto
                </Button>
            </Paper>
        </Box>
    );
};

export default Register;
