import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootState } from '../store/store';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  addNotification 
} from '../store/slices/notificationSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

interface UseNotificationsReturn {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { notifications, unreadCount, loading, error } = useAppSelector((state: RootState) => state.notifications);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Fetch notifications on mount and user change
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          const newNotification = payload.new as NotificationRow;
          dispatch(addNotification(newNotification));
          
          // Show toast notification for new notifications
          dispatch(showSnackbar({
            message: newNotification.title,
            severity: newNotification.type === 'error' ? 'error' : 'info'
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          // Handle notification updates (e.g., mark as read)
          console.log('Notification updated:', payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
          console.error('Failed to subscribe to notifications channel');
        }
      });

    return () => {
      channel.unsubscribe();
      setRealtimeConnected(false);
    };
  }, [user?.id, dispatch]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      dispatch(showSnackbar({
        message: 'Failed to mark notification as read',
        severity: 'error'
      }));
    }
  }, [dispatch]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await dispatch(markAllNotificationsAsRead(user.id)).unwrap();
      dispatch(showSnackbar({
        message: 'All notifications marked as read',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      dispatch(showSnackbar({
        message: 'Failed to mark all notifications as read',
        severity: 'error'
      }));
    }
  }, [dispatch, user?.id]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await dispatch(fetchNotifications({ userId: user.id })).unwrap();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [dispatch, user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
};

export default useNotifications;