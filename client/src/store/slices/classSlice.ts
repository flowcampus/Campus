import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { classesAPI } from '../../services/api';

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  level: string;
  section?: string;
  capacity: number;
  classTeacherId?: string;
  academicTermId: string;
  termName?: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  studentCount?: number;
  subjectCount?: number;
  students?: any[];
  subjects?: any[];
}

interface ClassState {
  classes: Class[];
  currentClass: Class | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classes: [],
  currentClass: null,
  loading: false,
  error: null,
};

export const fetchClassesBySchool = createAsyncThunk(
  'classes/fetchBySchool',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await classesAPI.getBySchool(schoolId, params);
      return response.classes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch classes');
    }
  }
);

export const fetchClassById = createAsyncThunk(
  'classes/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await classesAPI.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch class');
    }
  }
);

export const createClass = createAsyncThunk(
  'classes/create',
  async ({ schoolId, classData }: { schoolId: string; classData: any }, { rejectWithValue }) => {
    try {
      const response = await classesAPI.create(schoolId, classData);
      return response.class;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create class');
    }
  }
);

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClass: (state, action) => {
      state.currentClass = action.payload;
    },
    clearCurrentClass: (state) => {
      state.currentClass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassesBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassesBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
        state.error = null;
      })
      .addCase(fetchClassesBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.currentClass = {
          ...action.payload.class,
          students: action.payload.students,
          subjects: action.payload.subjects,
        };
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.classes.unshift(action.payload);
      });
  },
});

export const { clearError, setCurrentClass, clearCurrentClass } = classSlice.actions;
export default classSlice.reducer;
