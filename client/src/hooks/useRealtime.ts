import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];
type NotificationRow = Tables['notifications']['Row'];

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export const useRealtime = (
  options: UseRealtimeOptions,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const channelName = `${options.table}_${Date.now()}`;
      const newChannel = supabase.channel(channelName);

      newChannel
        .on(
          'postgres_changes',
          {
            event: options.event || '*',
            schema: 'public',
            table: options.table,
            ...(options.filter && { filter: options.filter })
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            try {
              callback(payload);
            } catch (err: any) {
              console.error('Realtime callback error:', err);
              setError(err.message);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setConnected(false);
            setError('Failed to connect to realtime channel');
          }
        });

      setChannel(newChannel);

      return () => {
        newChannel.unsubscribe();
        setConnected(false);
      };
    } catch (err: any) {
      setError(err.message);
    }
  }, [options.table, options.filter, options.event]);

  return { connected, error, channel };
};

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { connected } = useRealtime(
    {
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
      event: 'INSERT'
    },
    (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
      if (payload.eventType === 'INSERT') {
        const newNotification = payload.new as NotificationRow;
        setNotifications(prev => [newNotification, ...prev]);
        if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        setNotifications(data as NotificationRow[] || []);
        setUnreadCount(data?.filter((n: NotificationRow) => !n.is_read).length || 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map((n: NotificationRow) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead
  };
};