import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { animations } from '../../styles/responsive';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sizeMap = {
    small: { spinner: 24, icon: 20, text: '0.875rem' },
    medium: { spinner: 40, icon: 32, text: '1rem' },
    large: { spinner: 56, icon: 48, text: '1.125rem' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 3 },
        ...animations.fadeIn,
      }}
    >
      {/* Animated Logo */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size={isMobile ? currentSize.spinner * 0.8 : currentSize.spinner}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            ...animations.pulse,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <SchoolIcon
            sx={{
              fontSize: isMobile ? currentSize.icon * 0.8 : currentSize.icon,
              color: theme.palette.primary.main,
            }}
          />
        </Box>
      </Box>

      {/* Loading Message */}
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{
          fontSize: isMobile ? '0.875rem' : currentSize.text,
          fontWeight: 500,
          maxWidth: 300,
          px: 2,
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
