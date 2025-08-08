import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teachersAPI } from '../../services/api';

export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  qualification?: string;
  specialization?: string;
  hireDate: string;
  salary?: number;
  status: string;
  classesCount?: number;
  subjectsCount?: number;
  schoolName?: string;
  assignments?: any[];
}

interface TeacherState {
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: TeacherState = {
  teachers: [],
  currentTeacher: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

export const fetchTeachersBySchool = createAsyncThunk(
  'teachers/fetchBySchool',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await teachersAPI.getBySchool(schoolId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teachers');
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await teachersAPI.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teacher');
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/create',
  async ({ schoolId, teacherData }: { schoolId: string; teacherData: any }, { rejectWithValue }) => {
    try {
      const response = await teachersAPI.create(schoolId, teacherData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create teacher');
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await teachersAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update teacher');
    }
  }
);

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeacher: (state, action) => {
      state.currentTeacher = action.payload;
    },
    clearCurrentTeacher: (state) => {
      state.currentTeacher = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachersBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachersBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.teachers;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTeachersBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.currentTeacher = action.payload;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.teachers.unshift(action.payload);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.teachers.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
        if (state.currentTeacher?.id === action.payload.id) {
          state.currentTeacher = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentTeacher, clearCurrentTeacher } = teacherSlice.actions;
export default teacherSlice.reducer;
