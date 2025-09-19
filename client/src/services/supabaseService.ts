import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type ProfileRow = Tables['profiles']['Row'];
type ProfileInsert = Tables['profiles']['Insert'];
type ProfileUpdate = Tables['profiles']['Update'];
type School = Tables['schools']['Row'];
type SchoolInsert = Tables['schools']['Insert'];
type Student = Tables['students']['Row'];
type StudentInsert = Tables['students']['Insert'];
type Teacher = Tables['teachers']['Row'];
type NotificationRow = Tables['notifications']['Row'];
type NotificationInsert = Tables['notifications']['Insert'];

export class SupabaseService {
  // Authentication
  static async signUp(email: string, password: string, metadata: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        return { user: { ...user, profile }, error: null };
      }
      
      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: handleSupabaseError(error) };
    }
  }

  // Profile Management
  static async getProfile(userId: string): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          schools (
            id,
            name,
            code,
            type
          )
        `)
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // School Management
  static async getSchools(filters?: { search?: string; type?: string; status?: boolean }): Promise<{ data: School[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.status !== undefined) {
        query = query.eq('is_active', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async createSchool(schoolData: SchoolInsert): Promise<{ data: School | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Student Management
  static async getStudents(schoolId: string, filters?: { 
    search?: string; 
    classId?: string; 
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          classes (
            name,
            level,
            section
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`student_id.ilike.%${filters.search}%,profiles.first_name.ilike.%${filters.search}%,profiles.last_name.ilike.%${filters.search}%`);
      }

      if (filters?.classId) {
        query = query.eq('class_id', filters.classId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async createStudent(studentData: StudentInsert): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Attendance Management
  static async markAttendance(attendanceRecords: Tables['attendance']['Insert'][]): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,date'
        })
        .select();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async getAttendance(classId: string, date: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (
            student_id,
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .eq('class_id', classId)
        .eq('date', date);
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Grades Management
  static async recordGrade(gradeData: Tables['grades']['Insert']): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert(gradeData)
        .select(`
          *,
          students (
            student_id,
            profiles (
              first_name,
              last_name
            )
          ),
          subjects (
            name,
            code
          )
        `)
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async getStudentGrades(studentId: string, termId?: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('grades')
        .select(`
          *,
          subjects (
            name,
            code
          ),
          academic_terms (
            name
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (termId) {
        query = query.eq('academic_term_id', termId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Notifications
  static async createNotification(notificationData: NotificationInsert): Promise<{ data: NotificationRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async getUserNotifications(userId: string, unreadOnly = false): Promise<{ data: NotificationRow[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<{ data: NotificationRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Real-time subscriptions
  static subscribeToNotifications(userId: string, callback: (payload: RealtimePostgresChangesPayload<NotificationRow>) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToAnnouncements(schoolId: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void) {
    return supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `school_id=eq.${schoolId}`
        },
        callback
      )
      .subscribe();
  }

  // Analytics and Reports
  static async getSchoolStats(schoolId: string): Promise<{ data: { totalStudents: number; totalTeachers: number; totalClasses: number } | null; error: string | null }> {
    try {
      const [studentsResult, teachersResult, classesResult] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('status', 'active'),
        supabase
          .from('teachers')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('status', 'active'),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
      ]);

      return {
        data: {
          totalStudents: studentsResult.count || 0,
          totalTeachers: teachersResult.count || 0,
          totalClasses: classesResult.count || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Error handling wrapper
  static async executeQuery<T>(queryFn: () => Promise<{ data: T; error: any }>): Promise<{ data: T | null; error: string | null }> {
    try {
      const result = await queryFn();
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }
}

export default SupabaseService;