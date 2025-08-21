import React, { useState, useEffect, useMemo } from 'react';
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

const steps = ['Personal Info', 'School & Locale', 'Account Setup', 'Parent Link'];

const validationSchemas = [
  // Step 1: Personal Info + Locale
  yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    dateOfBirth: yup.date().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),
    country: yup.string().required('Country is required'),
    language: yup.string().required('Language is required'),
  }),
  // Step 2: School & Class Selection
  yup.object({
    schoolCode: yup.string().required('School selection is required'),
    level: yup.string().required('Level is required'),
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

// Country -> Languages mapping (expandable). Focus Cameroon demo per requirements.
const countryLanguages: Record<string, string[]> = {
  Cameroon: ['English', 'French'],
  Nigeria: ['English'],
  USA: ['English'],
};

// Level options per (country, language)
const levelOptions: Record<string, Record<string, string[]>> = {
  Cameroon: {
    English: ['Nursery', 'Primary', 'Secondary', 'High School'],
    French: ["Maternelle", 'Primaire', 'Secondaire', 'Lycée'],
  },
  Nigeria: {
    English: ['Primary', 'Junior Secondary', 'Senior Secondary'],
  },
  USA: {
    English: ['Elementary', 'Middle School', 'High School'],
  },
};

// Example classes per level (simplified; can be fetched from backend later)
const classesByLevel: Record<string, string[]> = {
  Nursery: ['Nursery 1', 'Nursery 2', 'Nursery 3'],
  Primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  Secondary: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'],
  'High School': ['Lower 6th', 'Upper 6th'],
  Maternelle: ['Petite Section', 'Moyenne Section', 'Grande Section'],
  Primaire: ['CM1', 'CM2', 'CM3', 'CM4', 'CM5', 'CM6'],
  Secondaire: ['6ème', '5ème', '4ème', '3ème', '2nde'],
  Lycée: ['1ère', 'Terminale'],
  'Junior Secondary': ['JSS1', 'JSS2', 'JSS3'],
  'Senior Secondary': ['SS1', 'SS2', 'SS3'],
  Elementary: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
  'Middle School': ['Grade 6', 'Grade 7', 'Grade 8'],
  'High School (US)': ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
};

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
      country: 'Cameroon',
      language: '',
      schoolCode: '',
      level: '',
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
    formik.setFieldValue('level', '');
    formik.setFieldValue('className', ''); // Reset class selection
  };

  // Derived options
  const availableLanguages = useMemo(() => countryLanguages[formik.values.country] || [], [formik.values.country]);
  const availableLevels = useMemo(() => {
    const byCountry = levelOptions[formik.values.country] || {};
    return byCountry[formik.values.language] || [];
  }, [formik.values.country, formik.values.language]);
  const availableClasses = useMemo(() => classesByLevel[formik.values.level] || [], [formik.values.level]);

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

            {/* Locale Selection */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <TextField
                fullWidth
                select
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={(e) => {
                  formik.handleChange(e);
                  // reset dependent fields
                  formik.setFieldValue('language', '');
                  formik.setFieldValue('level', '');
                  formik.setFieldValue('className', '');
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              >
                {Object.keys(countryLanguages).map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                name="language"
                label="Language of instruction"
                value={formik.values.language}
                onChange={(e) => {
                  formik.handleChange(e);
                  // reset dependent fields
                  formik.setFieldValue('level', '');
                  formik.setFieldValue('className', '');
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.language && Boolean(formik.errors.language)}
                helperText={formik.touched.language && formik.errors.language}
                disabled={!availableLanguages.length}
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Choose your school, level and class
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
              <>
                <TextField
                  fullWidth
                  select
                  name="level"
                  label="Select Level"
                  value={formik.values.level}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue('className', '');
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.level && Boolean(formik.errors.level)}
                  helperText={formik.touched.level && formik.errors.level}
                  sx={{ mb: 3 }}
                >
                  {availableLevels.map((lvl) => (
                    <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
                  ))}
                </TextField>

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
                  disabled={!formik.values.level}
                >
                  {availableClasses.map((className: string) => (
                    <MenuItem key={className} value={className}>
                      {className}
                    </MenuItem>
                  ))}
                </TextField>
              </>
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
