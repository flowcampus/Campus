import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { schoolsAPI } from '../../services/api';

export interface School {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  motto?: string;
  type: string;
  subscriptionPlan: string;
  subscriptionExpiresAt?: string;
  isActive: boolean;
  settings?: any;
  userCount?: number;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
  createdAt: string;
}

interface SchoolState {
  schools: School[];
  currentSchool: School | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: SchoolState = {
  schools: [],
  currentSchool: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchSchools = createAsyncThunk(
  'schools/fetchSchools',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch schools');
    }
  }
);

export const fetchSchoolById = createAsyncThunk(
  'schools/fetchSchoolById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch school');
    }
  }
);

export const createSchool = createAsyncThunk(
  'schools/createSchool',
  async (schoolData: any, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.create(schoolData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create school');
    }
  }
);

export const updateSchool = createAsyncThunk(
  'schools/updateSchool',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update school');
    }
  }
);

export const updateSchoolSubscription = createAsyncThunk(
  'schools/updateSubscription',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.updateSubscription(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update subscription');
    }
  }
);

export const fetchSchoolStats = createAsyncThunk(
  'schools/fetchStats',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await schoolsAPI.getStats(id);
      return { id, stats: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch school stats');
    }
  }
);

const schoolSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSchool: (state, action: PayloadAction<School | null>) => {
      state.currentSchool = action.payload;
    },
    clearCurrentSchool: (state) => {
      state.currentSchool = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload.schools;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch School by ID
      .addCase(fetchSchoolById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSchool = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create School
      .addCase(createSchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.schools.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update School
      .addCase(updateSchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schools.findIndex(school => school.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload;
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Subscription
      .addCase(updateSchoolSubscription.fulfilled, (state, action) => {
        const index = state.schools.findIndex(school => school.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = { ...state.schools[index], ...action.payload };
        }
        if (state.currentSchool?.id === action.payload.id) {
          state.currentSchool = { ...state.currentSchool, ...action.payload };
        }
      });
  },
});

export const { clearError, setCurrentSchool, clearCurrentSchool } = schoolSlice.actions;
export default schoolSlice.reducer;
