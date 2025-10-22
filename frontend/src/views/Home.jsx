import React from 'react';
import { Box, Typography } from '@mui/material';

const Home = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h3" gutterBottom>
      Tutaj pojawią się najnowsze twoje sprawy
    </Typography>
    <Typography variant="body1">
      To jest miejsce, gdzie możesz umieścić najważniejsze informacje.
    </Typography>
  </Box>
);

export default Home;