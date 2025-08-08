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
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  FamilyRestroom,
  ArrowBack,
  QrCodeScanner,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be minimum 6 characters')
    .required('Password is required'),
});

const ParentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [childCode, setChildCode] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(login({
        email: values.email,
        password: values.password,
        role: 'parent',
      }));
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLinkChild = () => {
    // In real implementation, this would link parent to child
    console.log('Linking child with code:', childCode);
    setShowLinkDialog(false);
    setChildCode('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/parent');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth/role-selection')}
            sx={{ mb: 2, alignSelf: 'flex-start' }}
          >
            Back to Role Selection
          </Button>
          
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <FamilyRestroom />
            Parent Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your child's progress and school activities
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              {/* Email */}
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
                sx={{ mb: 3 }}
              />

              {/* Password */}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
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
                  to="/auth/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 3,
                  bgcolor: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In as Parent'}
              </Button>

              {/* Link Child Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setShowLinkDialog(true)}
                sx={{ mb: 3 }}
              >
                Link to Your Child
              </Button>

              <Divider sx={{ my: 3 }}>
                <Chip label="OR" size="small" />
              </Divider>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have a parent account?{' '}
                  <Link
                    component={RouterLink}
                    to="/auth/register/parent"
                    variant="body2"
                    sx={{ textDecoration: 'none', fontWeight: 600 }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Child Linking Dialog */}
        <Dialog open={showLinkDialog} onClose={() => setShowLinkDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Link to Your Child</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your child's unique student code or scan their QR code to link your accounts.
            </Typography>
            
            <TextField
              fullWidth
              label="Student Code"
              value={childCode}
              onChange={(e) => setChildCode(e.target.value)}
              placeholder="e.g., STU-2024-001234"
              sx={{ mb: 2 }}
            />
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<QrCodeScanner />}
              sx={{ mb: 2 }}
            >
              Scan QR Code
            </Button>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              You can find your child's student code on their school ID card or contact the school administration.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleLinkChild} variant="contained" disabled={!childCode}>
              Link Child
            </Button>
          </DialogActions>
        </Dialog>

        {/* Help Section */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help linking your child?{' '}
            <Link href="/support" sx={{ textDecoration: 'none' }}>
              Contact support
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ParentLoginPage;
