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
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  AdminPanelSettings,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signIn, clearError } from '../../store/slices/supabaseAuthSlice';

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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (isLocked) return;
      
      try {
        await dispatch(signIn({
          email: values.email,
          password: values.password,
        })).unwrap();
        
        // Reset attempts on successful login
        setLoginAttempts(0);
      } catch (error) {
        setLoginAttempts(prev => prev + 1);
        
        // Lock after 5 failed attempts
        if (loginAttempts >= 4) {
          setIsLocked(true);
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
          }, 300000); // 5 minutes lockout
        }
      }
    },
  });


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

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);
  return (
    <Fade in timeout={600}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
        {/* Security Notice */}
        {loginAttempts > 2 && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            icon={<SecurityIcon />}
          >
            Multiple failed login attempts detected. Account will be temporarily locked after 5 failed attempts.
          </Alert>
        )}
        
        {/* Lockout Notice */}
        {isLocked && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
          >
            Account temporarily locked due to multiple failed login attempts. Please try again in 5 minutes.
          </Alert>
        )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => dispatch(clearError())}
        >
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
        disabled={isLocked}
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
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={isLocked}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
                  disabled={isLocked}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              </Tooltip>
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
              disabled={isLocked}
            />
          }
          label="Remember me"
        />
        <Link
          component={RouterLink}
          to="/auth/forgot-password"
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
        disabled={loading || isLocked}
        sx={{
          mb: 2,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
          },
          '&:disabled': {
            background: 'grey.300',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Signing In...
          </Box>
        ) : (
          isLocked ? 'Account Locked' : 'Sign In'
        )}
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Chip label="OR" size="small" />
      </Divider>


      {/* Register Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Link
            component={RouterLink}
            to="/auth/forgot-password"
            variant="body2"
            sx={{ 
              textDecoration: 'none',
              fontWeight: 500,
              color: 'primary.main',
              '&:hover': { color: 'primary.dark' }
            }}
          >
            Forgot password?
          </Link>
          <Link
            component={RouterLink}
            to="/auth/role-selection"
            variant="body2"
            sx={{ 
              textDecoration: 'none',
              fontWeight: 500,
              color: 'primary.main',
              '&:hover': { color: 'primary.dark' }
            }}
          >
            Choose your role
          </Link>
        </Box>
      </Box>


      {/* Multi-language Support Hint */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Available in English • Français • Pidgin
        </Typography>
      </Box>
    </Box>
    </Fade>
  );
};

export default LoginPage;
