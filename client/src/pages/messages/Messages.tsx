import React from 'react';
import { Box, Typography } from '@mui/material';

const Messages: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Messaging functionality coming soon...
      </Typography>
    </Box>
  );
};

export default Messages;
