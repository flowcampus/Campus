import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, guestLogin, adminLogin, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (adminMode) {
        dispatch(adminLogin({
          email: values.email,
          password: values.password,
          adminKey: values.password, // In real implementation, this would be separate
        }));
      } else {
        dispatch(login({
          email: values.email,
          password: values.password,
          rememberMe,
        }));
      }
    },
  });

  // Handle admin portal access (secret trigger)
  const handleLogoClick = () => {
    setAdminClickCount(prev => prev + 1);
    if (adminClickCount >= 4) {
      setAdminMode(true);
      setAdminClickCount(0);
    }
    // Reset counter after 3 seconds
    setTimeout(() => setAdminClickCount(0), 3000);
  };

  const handleGuestLogin = () => {
    dispatch(guestLogin());
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      {/* Admin Mode Indicator */}
      {adminMode && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setAdminMode(false)}
            >
              Exit
            </Button>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettings sx={{ mr: 1 }} />
            Admin Portal Access Mode
          </Box>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email Address"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label={adminMode ? "Admin Password/Key" : "Password"}
        type={showPassword ? 'text' : 'password'}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Remember Me & Forgot Password */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"
            />
          }
          label="Remember me"
        />
        <Link
          component={RouterLink}
          to="/forgot-password"
          variant="body2"
          sx={{ textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
      </Box>

      {/* Login Button */}
      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        disabled={loading}
        sx={{
          mb: 2,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            {adminMode ? 'Accessing Admin Portal...' : 'Signing In...'}
          </Box>
        ) : (
          <>
            {adminMode ? (
              <>
                <AdminPanelSettings sx={{ mr: 1 }} />
                Access Admin Portal
              </>
            ) : (
              'Sign In'
            )}
          </>
        )}
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Chip label="OR" size="small" />
      </Divider>

      {/* Guest Login */}
      <Button
        variant="outlined"
        fullWidth
        onClick={handleGuestLogin}
        disabled={loading}
        sx={{
          mb: 3,
          py: 1.5,
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white',
          },
        }}
      >
        <Person sx={{ mr: 1 }} />
        Continue as Guest
      </Button>

      {/* Register Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            variant="body2"
            sx={{ 
              textDecoration: 'none',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Sign up here
          </Link>
        </Typography>
      </Box>

      {/* Hidden Admin Portal Trigger */}
      <Box
        onClick={handleLogoClick}
        sx={{
          position: 'absolute',
          top: -50,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 20,
          height: 20,
          cursor: 'pointer',
          opacity: 0,
        }}
      />

      {/* Multi-language Support Hint */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Available in English • Français • Pidgin
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
