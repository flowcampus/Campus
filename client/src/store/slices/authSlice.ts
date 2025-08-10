import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: string;
  schoolRole?: string;
  schoolName?: string;
  schoolCode?: string;
  avatar?: string;
  adminRole?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('campus_token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { emailOrPhone: string; password: string; schoolCode?: string; role?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('campus_token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    schoolCode?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('campus_token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const guestLogin = createAsyncThunk(
  'auth/guestLogin',
  async (schoolCode: string | undefined, { rejectWithValue }) => {
    try {
      console.log('🔄 Guest login attempt with schoolCode:', schoolCode);
      const response = await authAPI.guestLogin(schoolCode);
      console.log('✅ Guest login response:', response);
      console.log('📦 Response data:', response.data);
      
      if (!response.data.token) {
        console.error('❌ No token in response:', response.data);
        return rejectWithValue('No authentication token received');
      }
      
      localStorage.setItem('campus_token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('❌ Guest login error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || error.message || 'Guest login failed');
    }
  }
);

// New thunk for parent-child linking
export const linkParentToChild = createAsyncThunk(
  'auth/linkParentToChild',
  async (linkData: { parentId: string; childCode: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.linkParentToChild(linkData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Parent-child linking failed');
    }
  }
);

// New thunk for magic link generation
export const generateMagicLink = createAsyncThunk(
  'auth/generateMagicLink',
  async (data: { email: string; adminRole: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.generateMagicLink(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Magic link generation failed');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials: { email: string; password: string; adminKey?: string; adminRole?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.adminLogin(credentials);
      localStorage.setItem('campus_token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Admin login failed');
    }
  }
);

// New OTP-based authentication
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (data: { emailOrPhone: string; purpose?: 'login' | 'verify' | 'reset' }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post('/auth/request-otp', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: { emailOrPhone: string; code: string; purpose?: 'login' | 'verify' | 'reset' }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post('/auth/verify-otp', data);
      if (data.purpose === 'login' && response.data.token) {
        localStorage.setItem('campus_token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'OTP verification failed');
    }
  }
);

// Google OAuth login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (data: { idToken: string; role?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post('/auth/google', data);
      localStorage.setItem('campus_token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Google login failed');
    }
  }
);

// Enhanced password reset
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (data: { emailOrPhone: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post('/auth/request-reset', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset instructions');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token?: string; emailOrPhone?: string; code?: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('campus_token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('campus_token');
      return rejectWithValue(error.response?.data?.error || 'Authentication failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('campus_token');
      return null;
    } catch (error: any) {
      localStorage.removeItem('campus_token');
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

// Legacy resetPassword removed - using enhanced version above

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('campus_token', action.payload.token);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Guest Login
      .addCase(guestLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(guestLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
