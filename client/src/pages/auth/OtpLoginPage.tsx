import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { requestOtp, verifyOtp, clearError } from '../../store/slices/authSlice';

const requestValidationSchema = yup.object({
  emailOrPhone: yup
    .string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Enter a valid email or phone number', (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
});

const verifyValidationSchema = yup.object({
  code: yup
    .string()
    .length(6, 'Code must be 6 digits')
    .matches(/^\d{6}$/, 'Code must contain only numbers')
    .required('Verification code is required'),
});

const OtpLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [contactMethod, setContactMethod] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const purpose = searchParams.get('purpose') || 'login';
  const prefilledContact = searchParams.get('contact') || '';

  const requestFormik = useFormik({
    initialValues: {
      emailOrPhone: prefilledContact,
    },
    validationSchema: requestValidationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(requestOtp({ 
          emailOrPhone: values.emailOrPhone, 
          purpose: purpose as any 
        })).unwrap();
        
        setContactMethod(values.emailOrPhone);
        setStep('verify');
        setCountdown(60);
        setCanResend(false);
      } catch (error) {
        console.error('Failed to request OTP:', error);
      }
    },
  });

  const verifyFormik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: verifyValidationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(verifyOtp({
          emailOrPhone: contactMethod,
          code: values.code,
          purpose: purpose as any,
        })).unwrap();
        
        if (purpose === 'login') {
          navigate('/dashboard');
        } else {
          navigate('/auth/reset-password');
        }
      } catch (error) {
        console.error('Failed to verify OTP:', error);
      }
    },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 'verify') {
      setCanResend(true);
    }
  }, [countdown, step]);

  const handleResendOtp = async () => {
    try {
      await dispatch(requestOtp({ 
        emailOrPhone: contactMethod, 
        purpose: purpose as any 
      })).unwrap();
      
      setCountdown(60);
      setCanResend(false);
      verifyFormik.setFieldValue('code', '');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const isEmail = contactMethod.includes('@');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth/login')}
            sx={{ 
              mb: 2, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Back to Login
          </Button>
          
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <SecurityIcon />
            OTP Login
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {step === 'request' 
              ? 'Enter your email or phone to receive a verification code'
              : 'Enter the verification code sent to your device'
            }
          </Typography>
        </Box>

        <Card elevation={24} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            {step === 'request' ? (
              /* Request OTP Form */
              <Box component="form" onSubmit={requestFormik.handleSubmit}>
                <TextField
                  fullWidth
                  name="emailOrPhone"
                  label="Email or Phone Number"
                  value={requestFormik.values.emailOrPhone}
                  onChange={requestFormik.handleChange}
                  onBlur={requestFormik.handleBlur}
                  error={requestFormik.touched.emailOrPhone && Boolean(requestFormik.errors.emailOrPhone)}
                  helperText={requestFormik.touched.emailOrPhone && requestFormik.errors.emailOrPhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {requestFormik.values.emailOrPhone.includes('@') ? (
                          <EmailIcon color="action" />
                        ) : (
                          <PhoneIcon color="action" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                {requestFormik.values.emailOrPhone && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {requestFormik.values.emailOrPhone.includes('@') 
                      ? '📧 We\'ll send a verification code to your email'
                      : '📱 We\'ll send a verification code via SMS'
                    }
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Sending Code...
                    </Box>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </Box>
            ) : (
              /* Verify OTP Form */
              <Box component="form" onSubmit={verifyFormik.handleSubmit}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Verification Code Sent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We sent a 6-digit code to:
                  </Typography>
                  <Chip
                    label={contactMethod}
                    icon={isEmail ? <EmailIcon /> : <PhoneIcon />}
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>

                <TextField
                  fullWidth
                  name="code"
                  label="Verification Code"
                  value={verifyFormik.values.code}
                  onChange={verifyFormik.handleChange}
                  onBlur={verifyFormik.handleBlur}
                  error={verifyFormik.touched.code && Boolean(verifyFormik.errors.code)}
                  helperText={verifyFormik.touched.code && verifyFormik.errors.code}
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' },
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || verifyFormik.values.code.length !== 6}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Verifying...
                    </Box>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                {/* Resend Code */}
                <Box sx={{ textAlign: 'center' }}>
                  {countdown > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Resend code in {countdown} seconds
                    </Typography>
                  ) : (
                    <Button
                      variant="text"
                      onClick={handleResendOtp}
                      disabled={loading || !canResend}
                      size="small"
                    >
                      Resend Code
                    </Button>
                  )}
                </Box>

                {/* Change Contact Method */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => {
                      setStep('request');
                      setCountdown(0);
                      setCanResend(false);
                      verifyFormik.resetForm();
                    }}
                    size="small"
                  >
                    Use Different {isEmail ? 'Phone' : 'Email'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            🔒 For your security, verification codes expire after 10 minutes and can only be used once.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default OtpLoginPage;