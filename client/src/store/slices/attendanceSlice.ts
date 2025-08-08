import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceAPI } from '../../services/api';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: string;
  studentId2?: string;
  firstName?: string;
  lastName?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

interface AttendanceState {
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  summary: null,
  loading: false,
  error: null,
};

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async ({ classId, attendanceData }: { classId: string; attendanceData: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.markAttendance(classId, attendanceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark attendance');
    }
  }
);

export const fetchAttendanceByClassAndDate = createAsyncThunk(
  'attendance/fetchByClassAndDate',
  async ({ classId, date }: { classId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getByClassAndDate(classId, date);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch attendance');
    }
  }
);

export const fetchStudentAttendanceSummary = createAsyncThunk(
  'attendance/fetchStudentSummary',
  async ({ studentId, params = {} }: { studentId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getStudentSummary(studentId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch attendance summary');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRecords: (state) => {
      state.records = [];
    },
    clearSummary: (state) => {
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAttendanceByClassAndDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByClassAndDate.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendanceByClassAndDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentAttendanceSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { clearError, clearRecords, clearSummary } = attendanceSlice.actions;
export default attendanceSlice.reducer;
