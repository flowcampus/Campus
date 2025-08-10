// Responsive Design System for Campus School Management System
// Mobile-first approach with adaptive breakpoints

export const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 600,    // Mobile landscape / Small tablet
  md: 960,    // Tablet portrait
  lg: 1280,   // Desktop / Tablet landscape
  xl: 1920,   // Large desktop
};

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  xxl: '3rem',    // 48px
  xxxl: '4rem'    // 64px
};

export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a'
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626'
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706'
  }
};

// Responsive utility functions
export const mediaQueries = {
  up: (breakpoint: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[breakpoint]})`,
  down: (breakpoint: keyof typeof breakpoints) => {
    const breakpointValues = Object.values(breakpoints);
    const breakpointKeys = Object.keys(breakpoints);
    const index = breakpointKeys.indexOf(breakpoint);
    if (index === 0) return '@media (max-width: 0px)';
    const prevValue = breakpointValues[index - 1];
    return `@media (max-width: calc(${prevValue} - 1px))`;
  },
  between: (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[min]}) and (max-width: calc(${breakpoints[max]} - 1px))`
};

// Common responsive patterns
export const responsivePatterns = {
  container: {
    width: '100%',
    maxWidth: { xs: '100%', sm: '100%', md: '960px', lg: '1200px', xl: '1400px' },
    margin: '0 auto',
    px: { xs: 2, sm: 3, md: 4, lg: 6 },
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  gridResponsive: {
    display: 'grid',
    gap: spacing.md,
    gridTemplateColumns: '1fr',
    [mediaQueries.up('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [mediaQueries.up('lg')]: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    }
  },
  
  cardBase: {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: shadows.base,
    padding: spacing.lg,
    [mediaQueries.up('md')]: {
      padding: spacing.xl
    }
  },
  
  buttonBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '0.375rem',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.tight,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    minHeight: '44px', // Touch-friendly minimum
    [mediaQueries.up('md')]: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSizes.base
    }
  },
  
  inputBase: {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.gray[300]}`,
    fontSize: typography.fontSizes.base,
    lineHeight: typography.lineHeights.normal,
    minHeight: '44px', // Touch-friendly minimum
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 3px ${colors.primary[100]}`
    }
  }
};

// Animation utilities
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    animation: 'fadeIn 0.3s ease-in-out'
  },
  
  slideInUp: {
    '@keyframes slideInUp': {
      from: { 
        opacity: 0,
        transform: 'translateY(20px)'
      },
      to: { 
        opacity: 1,
        transform: 'translateY(0)'
      }
    },
    animation: 'slideInUp 0.3s ease-out'
  },
  
  pulse: {
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 }
    },
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }
};

export default {
  breakpoints,
  spacing,
  typography,
  shadows,
  colors,
  mediaQueries,
  responsivePatterns,
  animations
};
