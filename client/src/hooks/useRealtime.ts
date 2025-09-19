import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export const useRealtime = (
  options: UseRealtimeOptions,
  callback: (payload: any) => void
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
          (payload) => {
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { connected } = useRealtime(
    {
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
      event: 'INSERT'
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev]);
        if (!payload.new.is_read) {
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
        
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
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
        prev.map(n =>
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