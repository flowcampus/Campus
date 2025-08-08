import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import schoolReducer from './slices/schoolSlice';
import studentReducer from './slices/studentSlice';
import teacherReducer from './slices/teacherSlice';
import classReducer from './slices/classSlice';
import attendanceReducer from './slices/attendanceSlice';
import gradeReducer from './slices/gradeSlice';
import feeReducer from './slices/feeSlice';
import announcementReducer from './slices/announcementSlice';
import eventReducer from './slices/eventSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolReducer,
    students: studentReducer,
    teachers: teacherReducer,
    classes: classReducer,
    attendance: attendanceReducer,
    grades: gradeReducer,
    fees: feeReducer,
    announcements: announcementReducer,
    events: eventReducer,
    messages: messageReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
