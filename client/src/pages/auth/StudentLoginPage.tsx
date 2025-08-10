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
  Autocomplete,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  ArrowBack,
  Person,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  identifier: yup
    .string()
    .required('Email, username, or phone number is required'),
  password: yup
    .string()
    .min(6, 'Password should be minimum 6 characters')
    .required('Password is required'),
  schoolCode: yup
    .string()
    .required('School selection is required'),
});

// Mock schools data - in real app, this would come from API
const mockSchools = [
  { code: 'DEMO001', name: 'Campus Demo School', location: 'Lagos, Nigeria' },
  { code: 'ROYAL001', name: 'Royal Academy', location: 'Abuja, Nigeria' },
  { code: 'EXCEL001', name: 'Excellence International', location: 'Port Harcourt, Nigeria' },
];

const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
      schoolCode: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(login({
        emailOrPhone: values.identifier,
        password: values.password,
        schoolCode: values.schoolCode,
        role: 'student',
      }));
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school);
    formik.setFieldValue('schoolCode', school?.code || '');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/student');
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
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Person />
            Student Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access your classes, assignments, and school activities
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

              {/* School Selection */}
              <Autocomplete
                options={mockSchools}
                getOptionLabel={(option) => `${option.name} (${option.location})`}
                value={selectedSchool}
                onChange={(_, newValue) => handleSchoolSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Your School"
                    error={formik.touched.schoolCode && Boolean(formik.errors.schoolCode)}
                    helperText={formik.touched.schoolCode && formik.errors.schoolCode}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <School color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Student Identifier */}
              <TextField
                fullWidth
                id="identifier"
                name="identifier"
                label="Email, Username, or Phone Number"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.identifier && Boolean(formik.errors.identifier)}
                helperText={formik.touched.identifier && formik.errors.identifier}
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
                }}
              >
                {loading ? 'Signing In...' : 'Sign In as Student'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Chip label="OR" size="small" />
              </Divider>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have a student account?{' '}
                  <Link
                    component={RouterLink}
                    to="/auth/register/student"
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

        {/* Help Section */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact your school administrator or{' '}
            <Link href="/support" sx={{ textDecoration: 'none' }}>
              our support team
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentLoginPage;
