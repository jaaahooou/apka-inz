import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Box, Toolbar } from '@mui/material';

const DashboardLayout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <Header />
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {children}
    </Box>
  </Box>
);

export default DashboardLayout;