import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { SupabaseService } from '../services/supabaseService';

export interface UseSupabaseReturn {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

export const useSupabase = (): UseSupabaseReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData, error: profileError } = await SupabaseService.getProfile(session.user.id);
          if (profileError) {
            console.warn('Profile fetch error:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          const { data: profileData, error: profileError } = await SupabaseService.getProfile(session.user.id);
          if (profileError) {
            console.warn('Profile fetch error:', profileError);
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await SupabaseService.signIn(email, password);
      if (error) throw new Error(error);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await SupabaseService.signUp(email, password, metadata);
      if (error) throw new Error(error);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await SupabaseService.signOut();
      if (error) throw new Error(error);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');
      setError(null);
      const { data, error } = await SupabaseService.updateProfile(user.id, updates);
      if (error) throw new Error(error);
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile
  };
};