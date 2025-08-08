import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messagesAPI } from '../../services/api';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderRole?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientRole?: string;
}

interface MessageState {
  messages: Message[];
  sentMessages: Message[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: MessageState = {
  messages: [],
  sentMessages: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (messageData: any, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.send(messageData);
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ userId, params = {} }: { userId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getByUser(userId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.markAsRead(messageId);
      return { messageId, readAt: response.data.readAt };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark message as read');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.sentMessages = [];
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.sentMessages.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.unreadCount = action.payload.messages.filter((m: Message) => !m.isRead).length;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const message = state.messages.find(m => m.id === action.payload.messageId);
        if (message && !message.isRead) {
          message.isRead = true;
          message.readAt = action.payload.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearError, clearMessages, updateUnreadCount } = messageSlice.actions;
export default messageSlice.reducer;
