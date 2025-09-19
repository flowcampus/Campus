import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  showLogo?: boolean;
  variant?: 'circular' | 'linear';
  color?: 'primary' | 'secondary' | 'inherit';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
  showLogo = false,
  variant = 'circular',
  color = 'primary',
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          spinnerSize: 24,
          fontSize: '0.875rem',
          padding: 2,
        };
      case 'large':
        return {
          spinnerSize: 60,
          fontSize: '1.25rem',
          padding: 4,
        };
      default:
        return {
          spinnerSize: 40,
          fontSize: '1rem',
          padding: 3,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: sizeStyles.padding,
      }}
    >
      {showLogo && (
        <Box
          sx={{
            width: sizeStyles.spinnerSize + 20,
            height: sizeStyles.spinnerSize + 20,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.05)', opacity: 0.8 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <SchoolIcon
            sx={{
              fontSize: sizeStyles.spinnerSize - 10,
              color: 'white',
            }}
          />
        </Box>
      )}

      <CircularProgress
        size={sizeStyles.spinnerSize}
        color={color}
        sx={{
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: sizeStyles.fontSize,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.background.default, 0.9),
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <Card
          sx={{
            minWidth: 200,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size === 'large' ? 200 : size === 'small' ? 80 : 120,
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;