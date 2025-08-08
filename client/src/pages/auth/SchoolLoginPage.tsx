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
  MenuItem,
  Autocomplete,
  ButtonGroup,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  ArrowBack,
  AdminPanelSettings,
  Person,
  Build,
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
  schoolCode: yup
    .string()
    .required('School selection is required'),
  staffRole: yup
    .string()
    .required('Staff role is required'),
});

// Mock schools data
const mockSchools = [
  { code: 'DEMO001', name: 'Campus Demo School', location: 'Lagos, Nigeria' },
  { code: 'ROYAL001', name: 'Royal Academy', location: 'Abuja, Nigeria' },
  { code: 'EXCEL001', name: 'Excellence International', location: 'Port Harcourt, Nigeria' },
];

const staffRoles = [
  { value: 'school_admin', label: '🧑‍💼 School Administrator', description: 'Full school management access' },
  { value: 'teacher', label: '🧑‍🏫 Teacher', description: 'Classroom and student management' },
  { value: 'support_staff', label: '🧑‍🔧 Support Staff', description: 'Specialized role access (IT, Finance, etc.)' },
];

const SchoolLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [loginMode, setLoginMode] = useState<'existing' | 'new'>('existing');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      schoolCode: '',
      staffRole: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(login({
        email: values.email,
        password: values.password,
        schoolCode: values.schoolCode,
        role: values.staffRole,
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

  const handleCreateNewSchool = () => {
    navigate('/auth/register/school');
  };

  useEffect(() => {
    if (isAuthenticated) {
      const role = formik.values.staffRole;
      if (role === 'school_admin') {
        navigate('/dashboard/admin');
      } else if (role === 'teacher') {
        navigate('/dashboard/teacher');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate, formik.values.staffRole]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto', px: 2 }}>
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
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <School />
            School Staff Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access your school management dashboard
          </Typography>
        </Box>

        {/* Mode Selection */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              What would you like to do?
            </Typography>
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
              <Button
                variant={loginMode === 'existing' ? 'contained' : 'outlined'}
                onClick={() => setLoginMode('existing')}
                sx={{ py: 1.5 }}
              >
                Login to Existing School
              </Button>
              <Button
                variant={loginMode === 'new' ? 'contained' : 'outlined'}
                onClick={() => setLoginMode('new')}
                sx={{ py: 1.5 }}
              >
                Create New School
              </Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        {loginMode === 'new' ? (
          <Card elevation={3}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <School sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Create Your School Account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Set up your school's digital management system with our comprehensive registration wizard.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateNewSchool}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Start School Registration
              </Button>
            </CardContent>
          </Card>
        ) : (
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

                {/* Staff Role Selection */}
                <TextField
                  fullWidth
                  select
                  id="staffRole"
                  name="staffRole"
                  label="Your Role"
                  value={formik.values.staffRole}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.staffRole && Boolean(formik.errors.staffRole)}
                  helperText={formik.touched.staffRole && formik.errors.staffRole}
                  sx={{ mb: 3 }}
                >
                  {staffRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box>
                        <Typography variant="body1">{role.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Email */}
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="School Email Address"
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
                    bgcolor: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.dark',
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In to School'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Chip label="Need Help?" size="small" />
                </Divider>

                {/* Help Section */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Don't have access to your school account?
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/contact-admin')}
                  >
                    Contact School Administrator
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            🔒 Your school data is protected with enterprise-grade security. 
            All login attempts are logged for security purposes.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SchoolLoginPage;
