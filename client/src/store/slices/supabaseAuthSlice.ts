import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabaseService';
import type { AuthUser, AuthState, LoginCredentials, RegisterData } from '../../types/auth';

export type { AuthUser, AuthState };

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const { user, error } = await SupabaseService.getCurrentUser();
      if (error) throw new Error(error);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password, role }: LoginCredentials,
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await SupabaseService.signIn(email, password);
      if (error) throw new Error(error);
      
      // Validate role if specified
      if (role && data.user) {
        const { data: profile, error: profileError } = await SupabaseService.getProfile(data.user.id);
        if (profileError) throw new Error(profileError);
        
        if (profile?.role !== role) {
          throw new Error(`Invalid role. Expected ${role}, got ${profile?.role}`);
        }
      }
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    userData: RegisterData,
    { rejectWithValue }
  ) => {
    try {
      const metadata = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        school_code: userData.schoolCode
      };

      const { data, error } = await SupabaseService.signUp(userData.email, userData.password, metadata);
      if (error) throw new Error(error);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await SupabaseService.signOut();
      if (error) throw new Error(error);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<AuthUser['profile']>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      
      if (!userId) throw new Error('No user logged in');
      
      const { data, error } = await SupabaseService.updateProfile(userId, updates);
      if (error) throw new Error(error);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user as AuthUser;
      state.session = action.payload.session;
      state.isAuthenticated = !!action.payload.user;
      state.loading = false;
      state.initialized = true;
    },
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
      if (state.user) {
        state.user.profile = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    reset: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        if (action.payload) {
          state.user = action.payload as AuthUser;
          state.isAuthenticated = true;
          state.profile = action.payload.profile;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload as string;
      })
      
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user as AuthUser;
        state.session = action.payload.session;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.user = action.payload.user as AuthUser;
          state.session = action.payload.session;
          state.isAuthenticated = true;
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        if (state.user) {
          state.user.profile = action.payload;
        }
      });
  },
});

export const { setSession, setProfile, clearError, setLoading, reset } = authSlice.actions;
export default authSlice.reducer;