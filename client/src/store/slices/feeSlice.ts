import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feesAPI } from '../../services/api';

export interface FeeStructure {
  id: string;
  schoolId: string;
  classId?: string;
  academicTermId: string;
  feeType: string;
  amount: number;
  dueDate?: string;
  isMandatory: boolean;
  description?: string;
  termName?: string;
  className?: string;
  classLevel?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeStructureId: string;
  amountPaid: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'mobile_money' | 'smartsave';
  paymentReference?: string;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  recordedBy: string;
  feeType?: string;
  feeAmount?: number;
  termName?: string;
  recordedByFirstName?: string;
  recordedByLastName?: string;
}

export interface FeeStatus {
  id: string;
  feeType: string;
  amount: number;
  totalPaid: number;
  balance: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  dueDate?: string;
  termName?: string;
  className?: string;
}

export interface FeeSummary {
  totalExpected: number;
  totalCollected: number;
  outstandingBalance: number;
  studentsPaid: number;
  totalStudents: number;
  collectionRate: number;
}

interface FeeState {
  structures: FeeStructure[];
  payments: FeePayment[];
  studentFeeStatus: FeeStatus[];
  summary: FeeSummary | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: FeeState = {
  structures: [],
  payments: [],
  studentFeeStatus: [],
  summary: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

export const createFeeStructure = createAsyncThunk(
  'fees/createStructure',
  async ({ schoolId, feeData }: { schoolId: string; feeData: any }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.createStructure(schoolId, feeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create fee structure');
    }
  }
);

export const fetchFeeStructures = createAsyncThunk(
  'fees/fetchStructures',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getStructures(schoolId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fee structures');
    }
  }
);

export const recordFeePayment = createAsyncThunk(
  'fees/recordPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await feesAPI.recordPayment(paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to record payment');
    }
  }
);

export const fetchStudentFeeStatus = createAsyncThunk(
  'fees/fetchStudentStatus',
  async ({ studentId, params = {} }: { studentId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getStudentStatus(studentId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch student fee status');
    }
  }
);

export const fetchStudentPayments = createAsyncThunk(
  'fees/fetchStudentPayments',
  async ({ studentId, params = {} }: { studentId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getStudentPayments(studentId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch student payments');
    }
  }
);

export const fetchSchoolFeeSummary = createAsyncThunk(
  'fees/fetchSchoolSummary',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getSchoolSummary(schoolId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fee summary');
    }
  }
);

const feeSlice = createSlice({
  name: 'fees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFeeStatus: (state) => {
      state.studentFeeStatus = [];
    },
    clearPayments: (state) => {
      state.payments = [];
    },
    clearSummary: (state) => {
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFeeStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeeStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.structures.unshift(action.payload);
        state.error = null;
      })
      .addCase(createFeeStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeeStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.structures = action.payload;
        state.error = null;
      })
      .addCase(fetchFeeStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(recordFeePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordFeePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
        state.error = null;
      })
      .addCase(recordFeePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentFeeStatus.fulfilled, (state, action) => {
        state.studentFeeStatus = action.payload;
      })
      .addCase(fetchStudentPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSchoolFeeSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { clearError, clearFeeStatus, clearPayments, clearSummary } = feeSlice.actions;
export default feeSlice.reducer;
