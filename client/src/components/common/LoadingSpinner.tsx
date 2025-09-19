import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  variant?: 'spinner' | 'skeleton' | 'pulse';
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
  variant = 'spinner',
  children,
}) => {

  const sizeMap = {
    small: { spinner: 24, icon: 20, text: '0.875rem' },
    medium: { spinner: 40, icon: 32, text: '1rem' },
    large: { spinner: 56, icon: 48, text: '1.125rem' },
  };

  const currentSize = sizeMap[size];

  // Skeleton loading variant
  if (variant === 'skeleton' && children) {
    return (
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    );
  }

  // Pulse loading variant
  if (variant === 'pulse') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            width: currentSize.spinner,
            height: currentSize.spinner,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.6,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 0.8,
              },
              '100%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
            },
          }}
        />
    <Fade in timeout={300}>
      <Box
      <Box
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: fullScreen 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'transparent',
          backdropFilter: fullScreen ? 'blur(4px)' : 'none',
          justifyContent: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: fullScreen ? 9999 : 'auto',
          thickness={4}
          sx={{
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
              fontSize: currentSize.icon,
              color: 'primary.main',
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
          fontSize: currentSize.text,
          fontWeight: 500,
          maxWidth: 300,
          px: 2,
        }}
      >
        {message}
      </Typography>
      
      {/* Loading dots animation */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          '& > div': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: 'loadingDots 1.4s ease-in-out infinite both',
            '&:nth-of-type(1)': { animationDelay: '-0.32s' },
            '&:nth-of-type(2)': { animationDelay: '-0.16s' },
          },
          '@keyframes loadingDots': {
            '0%, 80%, 100%': {
              transform: 'scale(0)',
            },
            '40%': {
              transform: 'scale(1)',
            },
        {content}
      </Box>
    </Fade>
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
          bgcolor: 'rgba(255, 255, 255, 0.95)',
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

// Skeleton loading components
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={`${100 / columns}%`}
            height={40}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const CardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={120} />
    </CardContent>
  </Card>
);

export default LoadingSpinner;