export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          role: 'super_admin' | 'school_admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'guest'
          school_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'school_admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'guest'
          school_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'school_admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'guest'
          school_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          code: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          logo_url: string | null
          motto: string | null
          type: 'nursery' | 'primary' | 'secondary' | 'tertiary' | 'mixed' | null
          subscription_plan: 'free' | 'basic' | 'pro' | 'premium'
          subscription_expires_at: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          logo_url?: string | null
          motto?: string | null
          type?: 'nursery' | 'primary' | 'secondary' | 'tertiary' | 'mixed' | null
          subscription_plan?: 'free' | 'basic' | 'pro' | 'premium'
          subscription_expires_at?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          logo_url?: string | null
          motto?: string | null
          type?: 'nursery' | 'primary' | 'secondary' | 'tertiary' | 'mixed' | null
          subscription_plan?: 'free' | 'basic' | 'pro' | 'premium'
          subscription_expires_at?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          school_id: string
          student_id: string
          class_id: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          blood_group: string | null
          address: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_email: string | null
          guardian_relationship: string | null
          medical_conditions: string | null
          admission_date: string | null
          status: 'active' | 'suspended' | 'graduated' | 'transferred' | 'withdrawn'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          school_id: string
          student_id: string
          class_id?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_email?: string | null
          guardian_relationship?: string | null
          medical_conditions?: string | null
          admission_date?: string | null
          status?: 'active' | 'suspended' | 'graduated' | 'transferred' | 'withdrawn'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          school_id?: string
          student_id?: string
          class_id?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_email?: string | null
          guardian_relationship?: string | null
          medical_conditions?: string | null
          admission_date?: string | null
          status?: 'active' | 'suspended' | 'graduated' | 'transferred' | 'withdrawn'
          created_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          profile_id: string
          school_id: string
          employee_id: string
          qualification: string | null
          specialization: string | null
          hire_date: string | null
          salary: number | null
          status: 'active' | 'suspended' | 'terminated'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          school_id: string
          employee_id: string
          qualification?: string | null
          specialization?: string | null
          hire_date?: string | null
          salary?: number | null
          status?: 'active' | 'suspended' | 'terminated'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          school_id?: string
          employee_id?: string
          qualification?: string | null
          specialization?: string | null
          hire_date?: string | null
          salary?: number | null
          status?: 'active' | 'suspended' | 'terminated'
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school_id: string
          name: string
          level: string
          section: string | null
          capacity: number
          class_teacher_id: string | null
          academic_term_id: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          level: string
          section?: string | null
          capacity?: number
          class_teacher_id?: string | null
          academic_term_id: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          level?: string
          section?: string | null
          capacity?: number
          class_teacher_id?: string | null
          academic_term_id?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          remarks: string | null
          marked_by: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          remarks?: string | null
          marked_by: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late' | 'excused'
          remarks?: string | null
          marked_by?: string
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          academic_term_id: string
          assessment_type: 'test' | 'exam' | 'assignment' | 'project' | 'continuous_assessment'
          score: number
          max_score: number
          grade: string | null
          remarks: string | null
          recorded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          academic_term_id: string
          assessment_type: 'test' | 'exam' | 'assignment' | 'project' | 'continuous_assessment'
          score: number
          max_score?: number
          grade?: string | null
          remarks?: string | null
          recorded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          academic_term_id?: string
          assessment_type?: 'test' | 'exam' | 'assignment' | 'project' | 'continuous_assessment'
          score?: number
          max_score?: number
          grade?: string | null
          remarks?: string | null
          recorded_by?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          school_id: string | null
          title: string
          message: string
          type: 'info' | 'warning' | 'error' | 'success'
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_id?: string | null
          title: string
          message: string
          type: 'info' | 'warning' | 'error' | 'success'
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string | null
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'error' | 'success'
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          school_id: string
          title: string
          content: string
          target_audience: 'all' | 'students' | 'teachers' | 'parents' | 'staff'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          is_published: boolean
          publish_date: string | null
          expires_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          title: string
          content: string
          target_audience: 'all' | 'students' | 'teachers' | 'parents' | 'staff'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_published?: boolean
          publish_date?: string | null
          expires_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          title?: string
          content?: string
          target_audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_published?: boolean
          publish_date?: string | null
          expires_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}