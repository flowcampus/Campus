import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  progress?: {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
  subtitle?: string;
  badge?: {
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
  loading?: boolean;
  onClick?: () => void;
  onMenuClick?: () => void;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = '#2196F3',
  trend,
  progress,
  subtitle,
  badge,
  loading = false,
  onClick,
  onMenuClick,
  tooltip,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: { xs: 2, sm: 2.5 },
          iconSize: { xs: 32, sm: 36 },
          titleVariant: 'h6' as const,
          valueVariant: 'h5' as const,
        };
      case 'large':
        return {
          padding: { xs: 3, sm: 4 },
          iconSize: { xs: 48, sm: 56 },
          titleVariant: 'h5' as const,
          valueVariant: 'h3' as const,
        };
      default:
        return {
          padding: { xs: 2.5, sm: 3 },
          iconSize: { xs: 40, sm: 48 },
          titleVariant: 'h6' as const,
          valueVariant: 'h4' as const,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: sizeStyles.padding }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="circular" width={sizeStyles.iconSize.xs} height={sizeStyles.iconSize.xs} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>
          <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <CardContent sx={{ p: sizeStyles.padding, height: '100%' }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: sizeStyles.iconSize,
            height: sizeStyles.iconSize,
          }}
        >
          {icon}
        </Avatar>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              color={badge.color || 'primary'}
              sx={{ fontWeight: 600 }}
            />
          )}
          
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: trend.isPositive ? 'success.main' : 'error.main',
              }}
            >
              {trend.isPositive ? (
                <TrendingUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16 }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
          
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small">
                <InfoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          
          {onMenuClick && (
            <IconButton size="small" onClick={onMenuClick}>
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Value */}
      <Typography
        variant={sizeStyles.valueVariant}
        component="div"
        sx={{
          fontWeight: 700,
          mb: 1,
          color: 'text.primary',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>

      {/* Title */}
      <Typography
        variant={sizeStyles.titleVariant}
        color="text.secondary"
        sx={{
          fontWeight: 500,
          mb: subtitle ? 1 : 0,
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.75rem' }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Progress Bar */}
      {progress && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress.max ? (progress.value / progress.max) * 100 : progress.value}
            color={progress.color || 'primary'}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: theme.palette.action.hover,
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block' }}
          >
            {progress.max 
              ? `${progress.value} / ${progress.max}`
              : `${Math.round(progress.value)}%`
            }
          </Typography>
        </Box>
      )}

      {/* Trend Period */}
      {trend?.period && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          {trend.period}
        </Typography>
      )}
    </CardContent>
  );

  if (onClick) {
    return (
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {cardContent}
    </Card>
  );
};

export default StatsCard;