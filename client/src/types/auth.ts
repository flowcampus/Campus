import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from './database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser extends SupabaseUser {
  profile?: ProfileRow & {
    schools?: {
      id: string;
      name: string;
      code: string;
      type: string;
    };
  };
}

export interface AuthState {
  user: AuthUser | null;
  profile: AuthUser['profile'] | null;
  session: any;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  schoolCode?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  language?: string;
  level?: string;
  className?: string;
  parentEmail?: string;
  parentPhone?: string;
  relationship?: string;
}