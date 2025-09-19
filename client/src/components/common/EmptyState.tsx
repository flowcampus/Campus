import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    startIcon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    startIcon?: React.ReactNode;
  };
  illustration?: 'inbox' | 'search' | 'filter' | 'error' | 'custom';
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  illustration = 'inbox',
  size = 'medium',
  fullHeight = false,
}) => {
  const theme = useTheme();

  const getIllustration = () => {
    if (icon) return icon;
    
    const iconSize = size === 'small' ? 48 : size === 'large' ? 80 : 64;
    const iconProps = { sx: { fontSize: iconSize, color: 'text.disabled' } };
    
    switch (illustration) {
      case 'search':
        return <SearchIcon {...iconProps} />;
      case 'filter':
        return <FilterIcon {...iconProps} />;
      case 'error':
        return <RefreshIcon {...iconProps} />;
      default:
        return <InboxIcon {...iconProps} />;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          py: 3,
          px: 2,
          titleVariant: 'h6' as const,
          descriptionVariant: 'body2' as const,
        };
      case 'large':
        return {
          py: 8,
          px: 4,
          titleVariant: 'h4' as const,
          descriptionVariant: 'body1' as const,
        };
      default:
        return {
          py: 6,
          px: 3,
          titleVariant: 'h5' as const,
          descriptionVariant: 'body1' as const,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '60vh' : 'auto',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent sx={{ ...sizeStyles }}>
          {/* Illustration */}
          <Box sx={{ mb: 3 }}>
            {getIllustration()}
          </Box>

          {/* Title */}
          <Typography
            variant={sizeStyles.titleVariant}
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant={sizeStyles.descriptionVariant}
            color="text.secondary"
            sx={{
              mb: action || secondaryAction ? 4 : 0,
              lineHeight: 1.6,
              maxWidth: 300,
              mx: 'auto',
            }}
          >
            {description}
          </Typography>

          {/* Actions */}
          {(action || secondaryAction) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {action && (
                <Button
                  variant={action.variant || 'contained'}
                  onClick={action.onClick}
                  startIcon={action.startIcon}
                  sx={{
                    minWidth: { xs: '100%', sm: 140 },
                    py: 1.5,
                  }}
                >
                  {action.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  variant={secondaryAction.variant || 'outlined'}
                  onClick={secondaryAction.onClick}
                  startIcon={secondaryAction.startIcon}
                  sx={{
                    minWidth: { xs: '100%', sm: 140 },
                    py: 1.5,
                  }}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmptyState;