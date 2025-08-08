import React from 'react';
import { Box, Typography } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Reports and analytics functionality coming soon...
      </Typography>
    </Box>
  );
};

export default Reports;
