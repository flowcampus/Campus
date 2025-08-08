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
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Person,
  Email,
  Lock,
  Phone,
  Link as LinkIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';

const steps = ['Personal Info', 'Account Setup', 'Link Child'];

const validationSchemas = [
  // Step 1: Personal Info
  yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phone: yup.string().required('Phone is required'),
    relationship: yup.string().required('Relationship is required'),
  }),
  // Step 2: Account Setup
  yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be minimum 6 characters').required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 3: Link Child (optional, but validate formats if provided)
  yup.object({
    childCode: yup.string(),
    childEmail: yup.string().email('Enter a valid email').nullable().transform((v) => v || ''),
  }),
];

const ParentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      relationship: '',
      email: '',
      password: '',
      confirmPassword: '',
      childCode: '',
      childEmail: '',
    },
    validationSchema: validationSchemas[activeStep],
    onSubmit: (values) => {
      if (activeStep === steps.length - 1) {
        const { confirmPassword, ...registrationData } = values;
        dispatch(
          register({
            ...registrationData,
            role: 'parent',
          })
        );
      } else {
        setActiveStep(activeStep + 1);
      }
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Your details
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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

            <TextField
              fullWidth
              name="phone"
              label="Phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              select
              fullWidth
              name="relationship"
              label="Relationship to Child"
              value={formik.values.relationship}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.relationship && Boolean(formik.errors.relationship)}
              helperText={formik.touched.relationship && formik.errors.relationship}
            >
              {['Mother', 'Father', 'Guardian', 'Other'].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 1:
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
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon /> Link your child (optional)
            </Typography>

            <TextField
              fullWidth
              name="childCode"
              label="Student Code (optional)"
              value={formik.values.childCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.childCode && Boolean(formik.errors.childCode)}
              helperText={formik.touched.childCode && formik.errors.childCode}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              name="childEmail"
              label="Child's Email (optional)"
              value={formik.values.childEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.childEmail && Boolean(formik.errors.childEmail)}
              helperText={formik.touched.childEmail && formik.errors.childEmail}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} color="primary" />
              }
              label="I agree to the Terms of Service and Privacy Policy"
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/auth/role-selection')} sx={{ mb: 2 }}>
            Back to Role Selection
          </Button>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Person /> Parent Registration
          </Typography>
        </Box>

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

export default ParentRegisterPage;
