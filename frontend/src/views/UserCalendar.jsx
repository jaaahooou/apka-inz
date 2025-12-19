import React, { useState, useMemo } from 'react';
import { Box, Grid, Container, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import AddEventDialog from '../components/calendar/AddEventDialog';
import useHearings from '../hooks/useHearings';
import useCases from '../hooks/useCases'; // Potrzebujemy spraw do listy rozwijanej

const UserCalendar = () => {
  const theme = useTheme();
  
  // Pobieranie danych z backendu
  // Destrukturyzujemy createHearing z hooka
  const { data: hearingsData, loading: hearingsLoading, error, createHearing } = useHearings();
  const { data: casesData } = useCases(); // Pobieramy listę spraw dla formularza

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Stan dla nowej rozprawy - zgodny z modelem backendowym i formularzem AddEventDialog
  const [newEvent, setNewEvent] = useState({ 
    case: '', 
    location: '', 
    time: '10:00', 
    status: 'zaplanowana',
    notes: '' 
  });

  // Definicja kolorów na podstawie statusu
  const eventColors = {
    zaplanowana: '#0984E3', // Niebieski
    odbyta: '#00B894',      // Zielony
    odlozona: '#D63031',    // Czerwony
  };

  // Transformacja danych z backendu na format kalendarza
  const events = useMemo(() => {
    if (!hearingsData) return [];

    return hearingsData.map(hearing => {
      const dateObj = new Date(hearing.date_time);
      
      // Mapowanie statusu backendowego na klucz koloru
      let type = 'hearing';
      if (hearing.status === 'zaplanowana') type = 'zaplanowana';
      if (hearing.status === 'odbyta') type = 'odbyta';
      if (hearing.status === 'odłożona') type = 'odlozona';

      return {
        id: hearing.id,
        dateObj: dateObj, // Przechowujemy pełny obiekt daty do filtrowania w Grid
        date: dateObj.getDate(),
        // Jeśli nazwa sprawy jest dostępna w API (np. przez serializer), używamy jej
        title: hearing.case_number || `Sprawa #${hearing.case}`, 
        description: hearing.location,
        type: type,
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        originalData: hearing
      };
    });
  }, [hearingsData]);

  const monthName = currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const handleAddEvent = () => {
    if (selectedDate) {
      setDialogOpen(true);
    }
  };

  const handleEventChange = (field, value) => {
    setNewEvent({ ...newEvent, [field]: value });
  };

  // Zapisywanie nowej rozprawy w bazie
  const handleSaveEvent = async () => {
    if (!newEvent.case || !selectedDate) {
        alert("Wybierz sprawę i datę.");
        return;
    }

    // Tworzymy datę w formacie ISO (np. "2025-10-15T10:00:00")
    // selectedDate to tylko numer dnia (int) z kalendarza, resztę bierzemy z currentDate
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    const [hours, minutes] = newEvent.time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes));

    // Przygotowanie payloadu dla backendu
    const payload = {
        case: newEvent.case, // ID wybranej sprawy
        date_time: dateObj.toISOString(),
        location: newEvent.location,
        status: newEvent.status,
        notes: newEvent.notes
    };

    try {
        await createHearing(payload);
        setDialogOpen(false);
        // Reset formularza
        setNewEvent({ case: '', location: '', time: '10:00', status: 'zaplanowana', notes: '' });
    } catch (err) {
        alert("Błąd podczas dodawania rozprawy. Sprawdź konsolę.");
        console.error(err);
    }
  };

  if (hearingsLoading && events.length === 0) {
      return (
          <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
          </Box>
      );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        background: theme.palette.mode === 'light'
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, #1a1a1a 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <CalendarSidebar
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onAddEvent={handleAddEvent}
              events={events}
              eventColors={eventColors}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <CalendarGrid
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              events={events}
              eventColors={eventColors}
            />
          </Grid>
        </Grid>
      </Container>

      <AddEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
        monthName={monthName}
        newEvent={newEvent}
        onEventChange={handleEventChange}
        cases={casesData} // Przekazujemy listę spraw do selecta w dialogu
      />
    </Box>
  );
};

export default UserCalendar;