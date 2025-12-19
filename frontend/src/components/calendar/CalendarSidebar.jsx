import React from 'react';
import {
  Box,
  Card,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CalendarSidebar = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onDateClick,
  onAddEvent,
  events,
  eventColors,
}) => {
  const theme = useTheme();

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // POPRAWIONE FILTROWANIE DATY (Pełne porównanie)
  const getEventsForDate = (day) => {
    return events.filter(e => {
        return e.dateObj.getDate() === day &&
               e.dateObj.getMonth() === currentDate.getMonth() &&
               e.dateObj.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => selectedDate === day;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Lista wydarzeń dla wybranego dnia
  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: theme.palette.mode === 'light'
          ? '0 8px 32px rgba(0, 0, 0, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        height: 'fit-content',
        position: 'sticky',
        top: 20,
      }}
    >
      {/* Add Event Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddEvent}
          disabled={!selectedDate}
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            py: 1.5,
            background: selectedDate
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : theme.palette.action.disabled,
            color: selectedDate ? '#fff' : theme.palette.text.disabled,
            borderRadius: '12px',
            '&:hover': {
              background: selectedDate
                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                : theme.palette.action.disabled,
              boxShadow: selectedDate ? `0 8px 20px ${theme.palette.primary.main}40` : 'none',
            },
          }}
        >
          Dodaj termin
        </Button>
      </Box>

      {/* Mini Month Selector */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton size="small" onClick={onPrevMonth}>
            <ChevronLeftIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>
            {monthName}
          </Typography>
          <IconButton size="small" onClick={onNextMonth}>
            <ChevronRightIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        {/* Mini Calendar Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {dayNames.map((day) => (
            <Box key={day} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: theme.palette.text.secondary, mb: 0.5 }}>
                {day.substring(0, 1)}
              </Typography>
            </Box>
          ))}
          {days.map((day, idx) => (
            <Box
              key={idx}
              onClick={() => day && onDateClick(day)}
              sx={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: day ? 'pointer' : 'default',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: day
                  ? isToday(day)
                    ? theme.palette.primary.main
                    : isSelected(day)
                    ? theme.palette.primary.main + '40'
                    : getEventsForDate(day).length > 0
                    ? theme.palette.error.main + '20'
                    : theme.palette.action.hover
                  : 'transparent',
                color: day
                  ? isToday(day)
                    ? '#fff'
                    : theme.palette.text.primary
                  : theme.palette.text.disabled,
                '&:hover': day ? {
                  backgroundColor: isToday(day)
                    ? theme.palette.primary.main
                    : isSelected(day)
                    ? theme.palette.primary.main + '50'
                    : theme.palette.action.hover,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                } : {},
                border: isSelected(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
              }}
            >
              {day}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Selected Day Events Preview */}
      {selectedDate && (
          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1.5, display: 'block', color: theme.palette.text.secondary }}>
              Wydarzenia ({selectedDate} {monthName})
            </Typography>
            {selectedDayEvents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Brak wydarzeń</Typography>
            ) : (
                selectedDayEvents.map(event => (
                    <Box key={event.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: theme.palette.action.hover }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: eventColors[event.type] }}>
                            {event.time} - {event.title}
                        </Typography>
                        <Typography variant="caption" display="block">
                            {event.description}
                        </Typography>
                    </Box>
                ))
            )}
          </Box>
      )}

      {/* Legend */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1.5, display: 'block', color: theme.palette.text.secondary }}>
          Legenda
        </Typography>
        {Object.entries(eventColors).map(([type, color]) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '4px',
                backgroundColor: color,
              }}
            />
            <Typography variant="caption" sx={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
              {type}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default CalendarSidebar;