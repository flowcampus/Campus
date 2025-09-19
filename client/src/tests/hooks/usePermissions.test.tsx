import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import usePermissions from '../../hooks/usePermissions';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (authState: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: (state = {}) => state,
      notifications: (state = {}) => state,
      messages: (state = {}) => state,
      schools: (state = {}) => state,
      students: (state = {}) => state,
      teachers: (state = {}) => state,
      classes: (state = {}) => state,
      attendance: (state = {}) => state,
      grades: (state = {}) => state,
      fees: (state = {}) => state,
      announcements: (state = {}) => state,
      events: (state = {}) => state,
    },
    preloadedState: {
      auth: authState,
    },
  });
};

const wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
);

describe('usePermissions Hook', () => {
  test('returns correct permissions for super admin', () => {
    const store = createMockStore({
      user: { id: '1', role: 'super_admin' },
      profile: { role: 'super_admin' },
      isAuthenticated: true,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.students.canView).toBe(true);
    expect(result.current.students.canCreate).toBe(true);
    expect(result.current.students.canEdit).toBe(true);
    expect(result.current.students.canDelete).toBe(true);
    expect(result.current.students.canManage).toBe(true);
  });

  test('returns correct permissions for student', () => {
    const store = createMockStore({
      user: { id: '1', role: 'student' },
      profile: { role: 'student' },
      isAuthenticated: true,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.students.canView).toBe(true);
    expect(result.current.students.canCreate).toBe(false);
    expect(result.current.students.canEdit).toBe(true); // Own profile only
    expect(result.current.students.canDelete).toBe(false);
    expect(result.current.students.canManage).toBe(false);
  });

  test('returns default permissions for guest', () => {
    const store = createMockStore({
      user: { id: '1', role: 'guest' },
      profile: { role: 'guest' },
      isAuthenticated: true,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.students.canView).toBe(false);
    expect(result.current.students.canCreate).toBe(false);
    expect(result.current.students.canEdit).toBe(false);
    expect(result.current.students.canDelete).toBe(false);
    expect(result.current.students.canManage).toBe(false);
  });
});