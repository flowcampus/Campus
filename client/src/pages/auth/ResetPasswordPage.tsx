import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppDispatch } from '../../store/store';
import { resetPassword } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  code: Yup.string().when('resetMethod', {
    is: 'sms',
    then: (schema) => schema.required('Reset code is required').length(6, 'Code must be 6 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const ResetPasswordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');

  const token = searchParams.get('token');
  const phone = searchParams.get('phone');

  useEffect(() => {
    if (phone) {
      setResetMethod('sms');
    } else if (!token) {
      // No token or phone, redirect to forgot password
      navigate('/auth/forgot-password');
    }
  }, [token, phone, navigate]);

  const handleSubmit = async (values: { code?: string; newPassword: string; confirmPassword: string }, { setSubmitting, setFieldError }: any) => {
    try {
      const resetData: any = {
        newPassword: values.newPassword,
      };

      if (resetMethod === 'email' && token) {
        resetData.token = token;
      } else if (resetMethod === 'sms' && phone) {
        resetData.emailOrPhone = phone;
        resetData.code = values.code;
      }

      await dispatch(resetPassword(resetData)).unwrap();
      setIsSuccess(true);
    } catch (error: any) {
      if (resetMethod === 'sms') {
        setFieldError('code', error);
      } else {
        setFieldError('newPassword', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <Link
              to="/auth/login"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 inline-block text-center"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
            {resetMethod === 'sms' 
              ? 'Enter the code sent to your phone and your new password'
              : 'Enter your new password below'
            }
          </p>
        </div>

        <Formik
          initialValues={{ 
            code: '', 
            newPassword: '', 
            confirmPassword: '',
            resetMethod 
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6">
              {resetMethod === 'sms' && (
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Reset Code
                  </label>
                  <Field
                    type="text"
                    id="code"
                    name="code"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  />
                  <ErrorMessage name="code" component="div" className="mt-1 text-sm text-red-600" />
                  <p className="mt-1 text-sm text-gray-500">
                    Code sent to {phone}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Field
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ← Request New Reset Code
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
