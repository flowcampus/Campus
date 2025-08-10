import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../../store/store';
import { requestOtp, verifyOtp } from '../../store/slices/authSlice';

const phoneValidationSchema = Yup.object({
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Enter a valid phone number'),
});

const otpValidationSchema = Yup.object({
  code: Yup.string()
    .required('OTP code is required')
    .length(6, 'OTP must be 6 digits'),
});

const OtpLoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countdown, setCountdown] = useState(0);

  const prefilledPhone = searchParams.get('phone');

  useEffect(() => {
    if (prefilledPhone) {
      setPhoneNumber(prefilledPhone);
      setStep('otp');
    }
  }, [prefilledPhone]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (values: { phone: string }, { setSubmitting }: any) => {
    try {
      await dispatch(requestOtp({ emailOrPhone: values.phone, purpose: 'login' })).unwrap();
      setPhoneNumber(values.phone);
      setStep('otp');
      setCountdown(60);
    } catch (error) {
      // Error handled by Redux
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (values: { code: string }, { setSubmitting, setFieldError }: any) => {
    try {
      await dispatch(verifyOtp({ 
        emailOrPhone: phoneNumber, 
        code: values.code, 
        purpose: 'login' 
      })).unwrap();
      navigate('/dashboard');
    } catch (error: any) {
      setFieldError('code', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(requestOtp({ emailOrPhone: phoneNumber, purpose: 'login' })).unwrap();
      setCountdown(60);
    } catch (error) {
      // Error handled by Redux
    }
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Login with OTP</h2>
            <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
              Enter your phone number to receive a login code
            </p>
          </div>

          <Formik
            initialValues={{ phone: prefilledPhone || '' }}
            validationSchema={phoneValidationSchema}
            onSubmit={handlePhoneSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Field
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {isSubmitting || loading ? 'Sending OTP...' : 'Send Login Code'}
                </button>

                <div className="text-center space-y-2">
                  <Link
                    to="/auth/login"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    ← Back to Email Login
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Enter Login Code</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
            We sent a 6-digit code to {phoneNumber}
          </p>
        </div>

        <Formik
          initialValues={{ code: '' }}
          validationSchema={otpValidationSchema}
          onSubmit={handleOtpSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Login Code
                </label>
                <Field
                  type="text"
                  id="code"
                  name="code"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                />
                <ErrorMessage name="code" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting || loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in {countdown} seconds
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Resend Code
                  </button>
                )}
                
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-sm text-gray-600 hover:text-gray-500"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OtpLoginPage;
