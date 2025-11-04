// src/views/CalendarView.jsx
import React, { useState } from 'react';
import { Box, Grid, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import AddEventDialog from '../components/calendar/AddEventDialog';

const CalendarView = () => {
  const theme = useTheme();
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '10:00', type: 'court' });

  const [events, setEvents] = useState([
    { id: 1, date: 18, title: '12a Dinner', type: 'personal', time: '19:00' },
    { id: 2, date: 19, title: 'Dart Game?', type: 'personal', time: '20:00' },
    { id: 3, date: 19, title: '12z Design Review', type: 'business', time: '14:00' },
    { id: 4, date: 20, title: '12a Doctor\'s App', type: 'health', time: '10:00' },
    { id: 5, date: 20, title: 'Meeting With Cl', type: 'business', time: '15:00' },
    { id: 6, date: 22, title: 'Family Trip', type: 'personal', time: '08:00' },
    { id: 7, date: 25, title: 'Monthly Meeting', type: 'business', time: '10:00' },
  ]);

  const eventColors = {
    personal: '#FFB84D',
    business: '#0984E3',
    health: '#FF6B9D',
    court: '#6C5CE7',
    decision: '#00B894',
  };

  const eventLabels = {
    personal: '📌',
    business: '💼',
    health: '🏥',
    court: '⚖️',
    decision: '✅',
  };

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

  const handleSaveEvent = () => {
    if (newEvent.title) {
      setEvents([...events, {
        id: events.length + 1,
        date: selectedDate,
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time,
      }]);
      setDialogOpen(false);
      setNewEvent({ title: '', time: '10:00', type: 'court' });
    }
  };

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
        eventColors={eventColors}
        eventLabels={eventLabels}
      />
    </Box>
  );
};

export default CalendarView;
