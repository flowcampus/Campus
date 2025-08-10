import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { responsivePatterns, animations } from '../../styles/responsive';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRefresh={this.handleRefresh}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRefresh: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRefresh,
  onGoHome,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.default',
      }}
    >
      <Card
        sx={{
          ...responsivePatterns.cardBase,
          maxWidth: 500,
          textAlign: 'center',
          ...animations.slideInUp,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <ErrorIcon
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: 'error.main',
              mb: 2,
            }}
          />
          
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'error.main',
              mb: 2,
            }}
          >
            Oops! Something went wrong
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.6,
            }}
          >
            We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
          </Typography>

          {process.env.NODE_ENV === 'development' && error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.toString()}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                py: { xs: 1.5, sm: 1 },
              }}
            >
              Refresh Page
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                py: { xs: 1.5, sm: 1 },
              }}
            >
              Go Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorBoundary;
