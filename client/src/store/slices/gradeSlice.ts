import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gradesAPI } from '../../services/api';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  academicTermId: string;
  assessmentType: 'test' | 'exam' | 'assignment' | 'project' | 'continuous_assessment';
  score: number;
  maxScore: number;
  grade?: string;
  remarks?: string;
  recordedBy: string;
  subjectName?: string;
  subjectCode?: string;
  termName?: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  createdAt: string;
}

interface GradeState {
  grades: Grade[];
  loading: boolean;
  error: string | null;
}

const initialState: GradeState = {
  grades: [],
  loading: false,
  error: null,
};

export const recordGrade = createAsyncThunk(
  'grades/record',
  async (gradeData: any, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.record(gradeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to record grade');
    }
  }
);

export const fetchGradesByStudent = createAsyncThunk(
  'grades/fetchByStudent',
  async ({ studentId, params = {} }: { studentId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.getByStudent(studentId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch grades');
    }
  }
);

export const fetchGradesByClass = createAsyncThunk(
  'grades/fetchByClass',
  async ({ classId, subjectId, params = {} }: { classId: string; subjectId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.getByClass(classId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch class grades');
    }
  }
);

export const updateGrade = createAsyncThunk(
  'grades/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await gradesAPI.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update grade');
    }
  }
);

const gradeSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGrades: (state) => {
      state.grades = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recordGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades.unshift(action.payload);
        state.error = null;
      })
      .addCase(recordGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGradesByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGradesByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = action.payload;
        state.error = null;
      })
      .addCase(fetchGradesByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGradesByClass.fulfilled, (state, action) => {
        state.grades = action.payload;
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        const index = state.grades.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearGrades } = gradeSlice.actions;
export default gradeSlice.reducer;
