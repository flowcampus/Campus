import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentsAPI } from '../../services/api';

export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  studentId: string;
  classId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  medicalConditions?: string;
  admissionDate: string;
  status: string;
  className?: string;
  classLevel?: string;
  schoolName?: string;
}

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: StudentState = {
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

export const fetchStudentsBySchool = createAsyncThunk(
  'students/fetchBySchool',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await studentsAPI.getBySchool(schoolId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch students');
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await studentsAPI.getById(id);
      return response.student;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch student');
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/create',
  async ({ schoolId, studentData }: { schoolId: string; studentData: any }, { rejectWithValue }) => {
    try {
      const response = await studentsAPI.create(schoolId, studentData);
      return response.student;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await studentsAPI.update(id, data);
      return response.student;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update student');
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStudent: (state, action) => {
      state.currentStudent = action.payload;
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentsBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchStudentsBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.currentStudent = action.payload;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.unshift(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        if (state.currentStudent?.id === action.payload.id) {
          state.currentStudent = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentStudent, clearCurrentStudent } = studentSlice.actions;
export default studentSlice.reducer;
