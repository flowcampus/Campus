import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';

const MagicLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (!token) {
      setStatus('error');
      setMessage('Invalid magic link. Token is missing.');
      return;
    }

    // Simulate magic link verification
    const verifyMagicLink = async () => {
      try {
        // In real implementation, verify token with backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful verification
        const mockUser = {
          id: 'admin-' + Date.now(),
          email: 'admin@campus.com',
          firstName: 'Admin',
          lastName: 'User',
          role: role || 'super_admin',
          adminRole: role || 'super_admin',
        };

        const mockToken = 'mock-admin-token-' + Date.now();

        dispatch(setCredentials({ user: mockUser, token: mockToken }));
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting to admin dashboard...');
        
        setTimeout(() => {
          navigate('/dashboard/admin');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify magic link. Please try again or contact support.');
      }
    };

    verifyMagicLink();
  }, [searchParams, dispatch, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <CircularProgress size={60} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card elevation={24} sx={{ maxWidth: 400, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Logo */}
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 30, color: 'white' }} />
          </Box>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Magic Link Authentication
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Verifying your administrative access...
          </Typography>

          {/* Status Icon */}
          <Box sx={{ mb: 3 }}>
            {getStatusIcon()}
          </Box>

          {/* Status Message */}
          <Alert severity={getStatusColor()} sx={{ mb: 3 }}>
            {message || 'Processing your request...'}
          </Alert>

          {/* Action Buttons */}
          {status === 'error' && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/portal')}
              >
                Back to Portal
              </Button>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          )}

          {status === 'loading' && (
            <Typography variant="caption" color="text.secondary">
              This may take a few seconds...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MagicLogin;