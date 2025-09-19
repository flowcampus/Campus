import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      console.error('Production error:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
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
  errorInfo?: ErrorInfo;
  showDetails: boolean;
  onToggleDetails: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  showDetails,
  onToggleDetails,
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
          p: { xs: 3, sm: 4 },
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          boxShadow: 3,
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

          {/* Error Details Toggle */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BugReportIcon />}
              endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={onToggleDetails}
              sx={{ mb: 2 }}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>
            
            <Collapse in={showDetails}>
              <Alert severity="error" sx={{ textAlign: 'left', mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Details:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {error?.toString()}
                  {error?.stack && `\n\nStack Trace:\n${error.stack}`}
                  {errorInfo?.componentStack && `\n\nComponent Stack:${errorInfo.componentStack}`}
                </Typography>
              </Alert>
            </Collapse>
          </Box>

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
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Error ID: {Date.now().toString(36)} • Campus v1.0.0
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorBoundary;
