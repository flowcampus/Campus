import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppDispatch } from '../../store/store';
import { requestPasswordReset } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  emailOrPhone: Yup.string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Enter a valid email or phone number', (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
});

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedValue, setSubmittedValue] = useState('');

  const handleSubmit = async (values: { emailOrPhone: string }, { setSubmitting, setFieldError }: any) => {
    try {
      await dispatch(requestPasswordReset({ emailOrPhone: values.emailOrPhone })).unwrap();
      setSubmittedValue(values.emailOrPhone);
      setIsSubmitted(true);
    } catch (error: any) {
      setFieldError('emailOrPhone', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    const isEmail = submittedValue.includes('@');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Instructions Sent!
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isEmail 
                ? `We've sent password reset instructions to ${submittedValue}. Check your email and follow the link to reset your password.`
                : `We've sent a reset code to ${submittedValue}. Enter the code on the next screen to reset your password.`
              }
            </p>
            
            <div className="space-y-4">
              {!isEmail && (
                <Link
                  to={`/auth/reset-password?phone=${encodeURIComponent(submittedValue)}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 inline-block text-center"
                >
                  Enter Reset Code
                </Link>
              )}
              
              <Link
                to="/auth/login"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 inline-block text-center"
              >
                Back to Login
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Didn't receive anything? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
            Enter your email or phone number and we'll send you reset instructions
          </p>
        </div>

        <Formik
          initialValues={{ emailOrPhone: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <Field
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  placeholder="Enter your email or phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage name="emailOrPhone" component="div" className="mt-1 text-sm text-red-600" />
                
                {values.emailOrPhone && (
                  <div className="mt-2 text-sm text-gray-500">
                    {values.emailOrPhone.includes('@') 
                      ? '📧 We\'ll send a reset link to your email'
                      : '📱 We\'ll send a reset code via SMS'
                    }
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-sm sm:text-base font-medium min-h-[44px]"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ← Back to Login
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
