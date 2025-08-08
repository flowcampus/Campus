import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Autocomplete,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Person,
  School,
  Email,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';

const steps = ['Personal Info', 'School Selection', 'Account Setup', 'Parent Link'];

const validationSchemas = [
  // Step 1: Personal Info
  yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    dateOfBirth: yup.date().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),
  }),
  // Step 2: School Selection
  yup.object({
    schoolCode: yup.string().required('School selection is required'),
    className: yup.string().required('Class selection is required'),
  }),
  // Step 3: Account Setup
  yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be minimum 6 characters').required('Password is required'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 4: Parent Link (optional)
  yup.object({
    parentEmail: yup.string().email('Enter a valid parent email'),
    parentPhone: yup.string(),
  }),
];

const mockSchools = [
  { code: 'DEMO001', name: 'Campus Demo School', classes: ['Primary 1A', 'Primary 2A', 'JSS 1A'] },
  { code: 'ROYAL001', name: 'Royal Academy', classes: ['Grade 1', 'Grade 2', 'Grade 3'] },
];

const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      schoolCode: '',
      className: '',
      email: '',
      password: '',
      confirmPassword: '',
      parentEmail: '',
      parentPhone: '',
    },
    validationSchema: validationSchemas[activeStep],
    onSubmit: (values) => {
      if (activeStep === steps.length - 1) {
        // Final submission
        const { confirmPassword, ...registrationData } = values;
        dispatch(register({
          ...registrationData,
          role: 'student',
        }));
      } else {
        // Move to next step
        setActiveStep(activeStep + 1);
      }
    },
  });

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school);
    formik.setFieldValue('schoolCode', school?.code || '');
    formik.setFieldValue('className', ''); // Reset class selection
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/student');
    }
  }, [isAuthenticated, navigate]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Tell us about yourself
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
              />
            </Box>

            <TextField
              fullWidth
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              select
              name="gender"
              label="Gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Choose your school and class
            </Typography>
            
            <Autocomplete
              options={mockSchools}
              getOptionLabel={(option) => option.name}
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

            {selectedSchool && (
              <TextField
                fullWidth
                select
                name="className"
                label="Select Your Class"
                value={formik.values.className}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.className && Boolean(formik.errors.className)}
                helperText={formik.touched.className && formik.errors.className}
              >
                {selectedSchool.classes.map((className: string) => (
                  <MenuItem key={className} value={className}>
                    {className}
                  </MenuItem>
                ))}
              </TextField>
            )}
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
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
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
              Link to your parent (Optional)
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Your parent will receive an invitation to monitor your progress and school activities.
            </Alert>

            <TextField
              fullWidth
              name="parentEmail"
              label="Parent's Email (Optional)"
              type="email"
              value={formik.values.parentEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parentEmail && Boolean(formik.errors.parentEmail)}
              helperText={formik.touched.parentEmail && formik.errors.parentEmail}
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
              name="parentPhone"
              label="Parent's Phone (Optional)"
              value={formik.values.parentPhone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
              helperText={formik.touched.parentPhone && formik.errors.parentPhone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  color="primary"
                />
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
            Student Registration
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
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              {/* Step Content */}
              {renderStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || (activeStep === steps.length - 1 && !agreedToTerms)}
                  endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Creating...' : 
                   activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StudentRegisterPage;
