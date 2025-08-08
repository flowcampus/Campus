import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventsAPI } from '../../services/api';

export interface Event {
  id: string;
  schoolId: string;
  title: string;
  description?: string;
  eventType: 'exam' | 'meeting' | 'holiday' | 'sports' | 'cultural' | 'academic' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isAllDay: boolean;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  createdBy: string;
  authorFirstName?: string;
  authorLastName?: string;
  createdAt: string;
}

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};

export const createEvent = createAsyncThunk(
  'events/create',
  async ({ schoolId, eventData }: { schoolId: string; eventData: any }, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.create(schoolId, eventData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create event');
    }
  }
);

export const fetchEventsBySchool = createAsyncThunk(
  'events/fetchBySchool',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await eventsAPI.getBySchool(schoolId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch events');
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEventsBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEventsBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearEvents } = eventSlice.actions;
export default eventSlice.reducer;
