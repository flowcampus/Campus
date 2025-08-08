import React from 'react';
import { Box, Typography } from '@mui/material';

const UserManagement: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        User management functionality coming soon...
      </Typography>
    </Box>
  );
};

export default UserManagement;
