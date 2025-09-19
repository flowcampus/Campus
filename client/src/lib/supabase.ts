import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST301') {
    return 'Unauthorized access. Please check your permissions.';
  }
  
  if (error?.code === 'PGRST116') {
    return 'No data found for your request.';
  }
  
  if (error?.message?.includes('JWT')) {
    return 'Session expired. Please log in again.';
  }
  
  return error?.message || 'An unexpected error occurred. Please try again.';
};

// Type-safe query builder helpers
export const createTypedSupabaseClient = () => {
  return supabase;
};

export default supabase;