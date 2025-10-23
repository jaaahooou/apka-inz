import { Box, Typography } from '@mui/material';

const UserCalendar = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>
      Kalendarz
    </Typography>
    <Typography>
      Tutaj możesz przejrzeć daty spraw.
    </Typography>
  </Box>
);

export default UserCalendar;