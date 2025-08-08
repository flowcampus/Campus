import React from 'react';
import { Box, Typography } from '@mui/material';

const Announcements: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Announcements
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Announcements functionality coming soon...
      </Typography>
    </Box>
  );
};

export default Announcements;
