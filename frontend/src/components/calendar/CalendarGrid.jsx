// src/components/calendar/CalendarGrid.jsx
import React from 'react';
import {
  Box,
  Card,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CalendarGrid = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  selectedDate,
  onDateClick,
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

  const getEventsForDate = (day) => {
    return events.filter(e => e.date === day);
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
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: theme.palette.mode === 'light'
          ? '0 8px 32px rgba(0, 0, 0, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
            {new Date().getFullYear()}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
            {monthName}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={onPrevMonth} sx={{ color: '#fff' }}>
            <ChevronLeftIcon sx={{ fontSize: '2rem' }} />
          </IconButton>
          <Button
            onClick={onToday}
            sx={{
              color: '#fff',
              textTransform: 'none',
              mx: 1,
              px: 2,
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Today
          </Button>
          <IconButton onClick={onNextMonth} sx={{ color: '#fff' }}>
            <ChevronRightIcon sx={{ fontSize: '2rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Day Names */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, backgroundColor: theme.palette.background.paper }}>
        {dayNames.map((day) => (
          <Box
            key={day}
            sx={{
              p: 2,
              textAlign: 'center',
              backgroundColor: theme.palette.background.default,
              borderBottom: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          minHeight: '600px',
        }}
      >
        {days.map((day, idx) => {
          const dayEvents = day ? getEventsForDate(day) : [];
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <Paper
              key={idx}
              onClick={() => day && onDateClick(day)}
              sx={{
                p: 1.5,
                minHeight: '120px',
                cursor: day ? 'pointer' : 'default',
                backgroundColor: day
                  ? today
                    ? theme.palette.primary.main + '15'
                    : selected
                    ? theme.palette.primary.main + '10'
                    : theme.palette.background.paper
                  : theme.palette.action.disabled,
                border: selected
                  ? `3px solid ${theme.palette.primary.main}`
                  : today
                  ? `2px dashed ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': day ? {
                  boxShadow: `0 12px 32px ${theme.palette.primary.main}30`,
                } : {},
              }}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <Typography
                    sx={{
                      fontWeight: today ? 700 : 600,
                      fontSize: '1.1rem',
                      color: today ? theme.palette.primary.main : theme.palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {day}
                  </Typography>

                  {/* Events */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayEvents.slice(0, 2).map((event, eventIdx) => (
                      <Chip
                        key={eventIdx}
                        label={event.title}
                        size="small"
                        sx={{
                          backgroundColor: eventColors[event.type],
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: '22px',
                          '& .MuiChip-label': {
                            px: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: 'italic',
                          fontSize: '0.65rem',
                          color: theme.palette.text.secondary,
                          mt: 0.5,
                        }}
                      >
                        +{dayEvents.length - 2} more
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          );
        })}
      </Box>
    </Card>
  );
};

export default CalendarGrid;
