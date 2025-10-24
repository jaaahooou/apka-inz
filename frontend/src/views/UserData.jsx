import { Box, Typography } from '@mui/material';

const UserData = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>
      Twoje dane
    </Typography>
    <Typography>
      Tu możesz wyświetlać swoje dane.
    </Typography>
  </Box>
);

export default UserData;