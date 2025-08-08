import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { announcementsAPI } from '../../services/api';

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublished: boolean;
  publishDate?: string;
  expiresAt?: string;
  createdBy: string;
  authorFirstName?: string;
  authorLastName?: string;
  createdAt: string;
}

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  error: null,
};

export const createAnnouncement = createAsyncThunk(
  'announcements/create',
  async ({ schoolId, announcementData }: { schoolId: string; announcementData: any }, { rejectWithValue }) => {
    try {
      const response = await announcementsAPI.create(schoolId, announcementData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create announcement');
    }
  }
);

export const fetchAnnouncementsBySchool = createAsyncThunk(
  'announcements/fetchBySchool',
  async ({ schoolId, params = {} }: { schoolId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await announcementsAPI.getBySchool(schoolId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch announcements');
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnnouncements: (state) => {
      state.announcements = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAnnouncementsBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncementsBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
        state.error = null;
      })
      .addCase(fetchAnnouncementsBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAnnouncements } = announcementSlice.actions;
export default announcementSlice.reducer;
