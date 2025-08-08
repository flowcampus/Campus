import React from 'react';
import { Box, Typography } from '@mui/material';

const SystemLogs: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        System Logs
      </Typography>
      <Typography variant="body1" color="text.secondary">
        System logs functionality coming soon...
      </Typography>
    </Box>
  );
};

export default SystemLogs;
