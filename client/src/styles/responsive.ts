import { Theme } from '@mui/material/styles';

// Responsive design patterns and utilities
export const responsivePatterns = {
  // Container patterns
  container: {
    width: '100%',
    maxWidth: { xs: '100%', sm: '600px', md: '960px', lg: '1280px', xl: '1920px' },
    mx: 'auto',
    px: { xs: 2, sm: 3, md: 4 },
  },

  // Card patterns
  cardBase: {
    borderRadius: { xs: 2, sm: 3 },
    boxShadow: { xs: 1, sm: 2, md: 3 },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: { xs: 2, sm: 4, md: 6 },
    },
  },

  // Typography patterns
  heading: {
    fontWeight: { xs: 600, sm: 700 },
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
    lineHeight: { xs: 1.3, sm: 1.2 },
  },

  subheading: {
    fontWeight: 500,
    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
    lineHeight: 1.5,
  },

  // Button patterns
  primaryButton: {
    py: { xs: 1, sm: 1.5 },
    px: { xs: 2, sm: 3 },
    fontSize: { xs: '0.875rem', sm: '1rem' },
    fontWeight: 600,
    borderRadius: { xs: 1, sm: 2 },
  },

  // Form patterns
  formField: {
    mb: { xs: 2, sm: 3 },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.875rem', sm: '1rem' },
    },
  },

  // Grid patterns
  gridContainer: {
    spacing: { xs: 2, sm: 3, md: 4 },
  },

  // Table patterns
  tableContainer: {
    maxHeight: { xs: 400, sm: 500, md: 600 },
    '& .MuiTableCell-root': {
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      py: { xs: 1, sm: 1.5 },
    },
  },
};

// Animation utilities
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: 'fadeIn 0.6s ease-out',
  },

  slideInUp: {
    '@keyframes slideInUp': {
      from: { opacity: 0, transform: 'translateY(30px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: 'slideInUp 0.5s ease-out',
  },

  slideInLeft: {
    '@keyframes slideInLeft': {
      from: { opacity: 0, transform: 'translateX(-30px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    animation: 'slideInLeft 0.5s ease-out',
  },

  slideInRight: {
    '@keyframes slideInRight': {
      from: { opacity: 0, transform: 'translateX(30px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    animation: 'slideInRight 0.5s ease-out',
  },

  scaleIn: {
    '@keyframes scaleIn': {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    animation: 'scaleIn 0.4s ease-out',
  },

  bounce: {
    '@keyframes bounce': {
      '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
      '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
      '70%': { transform: 'translate3d(0, -15px, 0)' },
      '90%': { transform: 'translate3d(0, -4px, 0)' },
    },
    animation: 'bounce 1s ease-in-out',
  },

  pulse: {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.05)', opacity: 0.8 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    animation: 'pulse 2s ease-in-out infinite',
  },
};

// Breakpoint utilities
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Spacing utilities
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

// Color utilities
export const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Theme utilities
export const createResponsiveTheme = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    grey: colors.grey,
    background: {
      default: mode === 'dark' ? '#121212' : '#fafafa',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#212121',
      secondary: mode === 'dark' ? '#b0b0b0' : '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } },
    h2: { fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } },
    h3: { fontWeight: 600, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } },
    h4: { fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } },
    h5: { fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } },
    h6: { fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } },
    body1: { fontSize: { xs: '0.875rem', sm: '1rem' }, lineHeight: 1.6 },
    body2: { fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.5 },
    caption: { fontSize: { xs: '0.625rem', sm: '0.75rem' } },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Utility functions
export const getResponsiveValue = (
  values: { xs?: any; sm?: any; md?: any; lg?: any; xl?: any },
  breakpoint: keyof typeof breakpoints
) => {
  const orderedBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return values.xs;
};

export const createMediaQuery = (theme: Theme, breakpoint: string) => {
  return theme.breakpoints.up(breakpoint);
};