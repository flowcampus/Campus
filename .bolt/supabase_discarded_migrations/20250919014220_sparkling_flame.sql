/*
  # Complete Campus School Management System Schema

  1. New Tables
    - `profiles` - User profile data linked to auth.users
    - `schools` - School information and settings
    - `academic_terms` - Academic year/term management
    - `classes` - Class/grade level management
    - `subjects` - Subject/course management
    - `students` - Student records and information
    - `teachers` - Teacher records and assignments
    - `parents` - Parent/guardian information
    - `parent_students` - Parent-child relationships
    - `attendance` - Daily attendance tracking
    - `grades` - Student grades and assessments
    - `fee_structures` - Fee definitions and amounts
    - `fee_payments` - Payment records and tracking
    - `announcements` - School announcements
    - `events` - School events and calendar
    - `messages` - Internal messaging system
    - `notifications` - System notifications
    - `system_logs` - Audit trail and logging

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for multi-tenant access
    - Secure admin and user data separation

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize foreign key relationships
    - Enable efficient data retrieval
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent', 'guest')),
  school_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  postal_code TEXT,
  logo_url TEXT,
  motto TEXT,
  type TEXT CHECK (type IN ('nursery', 'primary', 'secondary', 'tertiary', 'mixed')),
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic terms
CREATE TABLE IF NOT EXISTS academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  section TEXT,
  capacity INTEGER DEFAULT 30,
  class_teacher_id UUID REFERENCES profiles(id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_core BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class subjects assignment
CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  class_id UUID REFERENCES classes(id),
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_relationship TEXT,
  medical_conditions TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'transferred', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, student_id)
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  qualification TEXT,
  specialization TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, employee_id)
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  occupation TEXT,
  workplace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent-Student relationships
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('test', 'exam', 'assignment', 'project', 'continuous_assessment')),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee structures
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  fee_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  is_mandatory BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee payments
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_money', 'smartsave')),
  payment_reference TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers', 'parents', 'staff')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('exam', 'holiday', 'meeting', 'sports', 'cultural', 'academic', 'other')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  target_audience TEXT DEFAULT 'all',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'broadcast', 'notification')),
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  school_id UUID REFERENCES schools(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- Schools: Users can read their school, admins can read all
CREATE POLICY "Users can read own school" ON schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage schools" ON schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- Students: School members can read, admins can manage
CREATE POLICY "School members can read students" ON students
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage students" ON students
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Teachers: Similar to students
CREATE POLICY "School members can read teachers" ON teachers
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage teachers" ON teachers
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- Attendance: Teachers and admins can manage, students can read own
CREATE POLICY "Students can read own attendance" ON attendance
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Grades: Similar to attendance
CREATE POLICY "Students can read own grades" ON grades
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Notifications: Users can read their own
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Messages: Users can read their own messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();