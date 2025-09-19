import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('LoadingSpinner Component', () => {
  test('renders with default props', () => {
    renderWithTheme(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    renderWithTheme(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('renders in fullscreen mode', () => {
    renderWithTheme(<LoadingSpinner fullScreen />);
    const container = screen.getByText('Loading...').closest('[style*="position: fixed"]');
    expect(container).toBeInTheDocument();
  });

  test('renders with logo when showLogo is true', () => {
    renderWithTheme(<LoadingSpinner showLogo />);
    // Check for the presence of the School icon
    expect(document.querySelector('[data-testid="SchoolIcon"]')).toBeInTheDocument();
  });
});