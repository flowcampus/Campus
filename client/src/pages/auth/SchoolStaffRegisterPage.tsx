import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Email,
  Lock,
  School,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';

const steps = ['School Selection', 'Personal Info', 'Account Setup', 'Staff Role'];

const validationSchemas = [
  // Step 1: School Selection
  yup.object({
    schoolCode: yup.string().required('School selection is required'),
  }),
  // Step 2: Personal Info
  yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
  }),
  // Step 3: Account Setup
  yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be minimum 6 characters').required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 4: Staff Role
  yup.object({
    staffRole: yup.string().required('Staff role is required'),
  }),
];

const mockSchools = [
  { code: 'DEMO001', name: 'Campus Demo School', location: 'Lagos, Nigeria' },
  { code: 'ROYAL001', name: 'Royal Academy', location: 'Abuja, Nigeria' },
  { code: 'EXCEL001', name: 'Excellence International', location: 'Port Harcourt, Nigeria' },
];

const staffRoles = [
  { value: 'school_admin', label: '🧑‍💼 School Administrator' },
  { value: 'teacher', label: '🧑‍🏫 Teacher' },
  { value: 'support_staff', label: '🧑‍🔧 Support Staff' },
];

const SchoolStaffRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formik = useFormik({
    initialValues: {
      schoolCode: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      staffRole: '',
    },
    validationSchema: validationSchemas[activeStep],
    onSubmit: (values) => {
      if (activeStep === steps.length - 1) {
        const { confirmPassword, staffRole, ...rest } = values;
        dispatch(
          register({
            ...rest,
            role: staffRole,
          })
        );
      } else {
        setActiveStep((s) => s + 1);
      }
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Route based on chosen staff role
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

  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school);
    formik.setFieldValue('schoolCode', school?.code || '');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Select your school
            </Typography>
            <Autocomplete
              options={mockSchools}
              getOptionLabel={(opt) => `${opt.name} (${opt.code})`}
              value={selectedSchool}
              onChange={(_e, value) => handleSchoolSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search school"
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
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Tell us about you
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Create your account
            </Typography>
            <TextField
              fullWidth
              name="email"
              label="Email"
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

            <TextField
              fullWidth
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
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword((s) => !s)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Choose your staff role
            </Typography>
            <TextField
              select
              fullWidth
              name="staffRole"
              label="Staff Role"
              value={formik.values.staffRole}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.staffRole && Boolean(formik.errors.staffRole)}
              helperText={formik.touched.staffRole && formik.errors.staffRole}
            >
              {staffRoles.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} color="primary" />
              }
              label="I agree to the Terms of Service and Privacy Policy"
              sx={{ mt: 3 }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/auth/role-selection')} sx={{ mb: 2 }}>
            Back to Role Selection
          </Button>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
          >
            <School /> School Staff Registration
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              {renderStepContent(activeStep)}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 0} startIcon={<ArrowBack />}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || (activeStep === steps.length - 1 && !agreedToTerms)}
                  endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Creating...' : activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SchoolStaffRegisterPage;
