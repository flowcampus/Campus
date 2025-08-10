import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { setCredentials } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const MagicLogin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processMagicLogin = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid magic link - no token provided');
        return;
      }

      try {
        // Call the magic login endpoint
        const response = await authAPI.get(`/auth/magic-login?token=${token}`);
        
        if (response.data.user && response.data.token) {
          // Set credentials in Redux store
          dispatch(setCredentials({
            user: response.data.user,
            token: response.data.token
          }));
          
          setStatus('success');
          setMessage('Successfully logged in! Redirecting to admin dashboard...');
          
          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        console.error('Magic login error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.error || 
          'Failed to process magic link. The link may be expired or invalid.'
        );
      }
    };

    processMagicLogin();
  }, [searchParams, dispatch, navigate]);

  const handleReturnToLogin = () => {
    navigate('/admin/portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 rounded-full h-12 w-12 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 rounded-full h-12 w-12 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Processing Magic Link...'}
            {status === 'success' && 'Login Successful!'}
            {status === 'error' && 'Login Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={handleReturnToLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Return to Admin Portal
            </button>
          )}
          
          {status === 'success' && (
            <div className="text-sm text-gray-500">
              Redirecting automatically...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicLogin;
