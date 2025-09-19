import React from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    startIcon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
  }>;
  badge?: {
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  };
  loading?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  badge,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={56} />
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.path}
              onClick={(e) => {
                if (crumb.path) {
                  e.preventDefault();
                  navigate(crumb.path);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                },
                cursor: crumb.path ? 'pointer' : 'default',
              }}
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
        }}
      >
        {/* Title and Subtitle */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            
            {badge && (
              <Chip
                label={badge.label}
                color={badge.color || 'primary'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.5,
                maxWidth: { xs: '100%', md: '70%' },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                startIcon={action.startIcon}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                fullWidth={isMobile}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  minWidth: isMobile ? '100%' : 120,
                }}
              >
                {action.loading ? 'Loading...' : action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;