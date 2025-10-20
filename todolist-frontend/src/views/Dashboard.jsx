import React from 'react';
import { Box, Toolbar } from '@mui/material';
import StatsCard from '../components/StatsCard';

const Dashboard = () => (
  <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
    <Toolbar />
    <Box sx={{ display: 'flex', mb: 3 }}>
      <StatsCard title="Użytkownicy" value="1,234" />
      <StatsCard title="Sprzedaż" value="567" />
      <StatsCard title="Odwiedziny" value="8,910" />
    </Box>
    {/* Tu możesz dodać wykresy lub inne funkcjonalności dashboard */}
  </Box>
);

export default Dashboard;