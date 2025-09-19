/*
  # Enable Row Level Security for Campus Tables

  1. Security Updates
    - Enable RLS on all existing tables
    - Add comprehensive RLS policies for each table
    - Ensure proper access control based on user roles and school associations

  2. Policy Structure
    - Users can access their own data
    - School staff can access school-related data
    - Admins have broader access within their scope
    - Students and parents have limited read access to relevant data

  3. Important Notes
    - All policies check user authentication
    - School-based isolation is enforced
    - Role-based permissions are implemented
    - Guest users have very limited read-only access
*/

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'guest'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's school ID
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT school_id 
    FROM school_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('super_admin', 'school_admin', 'principal');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users in their school"
  ON users FOR SELECT
  TO authenticated
  USING (
    is_admin() AND (
      get_user_role() = 'super_admin' OR
      id IN (
        SELECT user_id FROM school_users 
        WHERE school_id = get_user_school_id()
      )
    )
  );

CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Schools table policies
CREATE POLICY "Users can view their school"
  ON schools FOR SELECT
  TO authenticated
  USING (
    id = get_user_school_id() OR
    get_user_role() = 'super_admin'
  );

CREATE POLICY "School admins can update their school"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

CREATE POLICY "Super admins can manage all schools"
  ON schools FOR ALL
  TO authenticated
  USING (get_user_role() = 'super_admin');

-- School users table policies
CREATE POLICY "Users can view school associations"
  ON school_users FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (is_admin() AND school_id = get_user_school_id()) OR
    get_user_role() = 'super_admin'
  );

CREATE POLICY "Admins can manage school users"
  ON school_users FOR ALL
  TO authenticated
  USING (
    is_admin() AND (
      school_id = get_user_school_id() OR
      get_user_role() = 'super_admin'
    )
  );

-- Students table policies
CREATE POLICY "Students can view their own data"
  ON students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Parents can view their children's data"
  ON students FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'parent' AND
    id IN (
      SELECT student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "School staff can view school students"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

CREATE POLICY "School admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Teachers table policies
CREATE POLICY "Teachers can view their own data"
  ON teachers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "School staff can view school teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

CREATE POLICY "School admins can manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Classes table policies
CREATE POLICY "School members can view classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() OR
    get_user_role() = 'super_admin'
  );

CREATE POLICY "School admins can manage classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Attendance table policies
CREATE POLICY "Students can view their attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id = get_user_school_id()
    ) AND
    get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Grades table policies
CREATE POLICY "Students can view their grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage grades"
  ON grades FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE c.school_id = get_user_school_id()
    ) AND
    get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Fee structures table policies
CREATE POLICY "School members can view fee structures"
  ON fee_structures FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() OR
    get_user_role() = 'super_admin'
  );

CREATE POLICY "School admins can manage fee structures"
  ON fee_structures FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Fee payments table policies
CREATE POLICY "Students can view their payments"
  ON fee_payments FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's payments"
  ON fee_payments FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "School staff can manage payments"
  ON fee_payments FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      WHERE s.school_id = get_user_school_id()
    ) AND
    get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Announcements table policies
CREATE POLICY "School members can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    (
      is_published = true OR
      get_user_role() IN ('school_admin', 'principal', 'teacher')
    )
  );

CREATE POLICY "School admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Events table policies
CREATE POLICY "School members can view events"
  ON events FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "School admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

-- Messages table policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    school_id = get_user_school_id()
  );

CREATE POLICY "Users can update their sent messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Notifications table policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System logs table policies
CREATE POLICY "Admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    get_user_role() IN ('super_admin', 'school_admin') AND
    (school_id = get_user_school_id() OR get_user_role() = 'super_admin')
  );

CREATE POLICY "System can create logs"
  ON system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Academic terms table policies
CREATE POLICY "School members can view academic terms"
  ON academic_terms FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "School admins can manage academic terms"
  ON academic_terms FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Subjects table policies
CREATE POLICY "School members can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (school_id = get_user_school_id());

CREATE POLICY "School admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (
    school_id = get_user_school_id() AND
    get_user_role() IN ('school_admin', 'principal')
  );

-- Class subjects table policies
CREATE POLICY "School members can view class subjects"
  ON class_subjects FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Teachers can manage their class subjects"
  ON class_subjects FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes 
      WHERE school_id = get_user_school_id() 
      AND (class_teacher_id = auth.uid() OR get_user_role() IN ('school_admin', 'principal'))
    )
  );

-- Timetables table policies
CREATE POLICY "School members can view timetables"
  ON timetables FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Teachers can manage timetables"
  ON timetables FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    (
      class_id IN (
        SELECT id FROM classes WHERE school_id = get_user_school_id()
      ) AND
      get_user_role() IN ('school_admin', 'principal')
    )
  );

-- Parents table policies
CREATE POLICY "Parents can view their own data"
  ON parents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Parents can update their own data"
  ON parents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "School admins can view parents"
  ON parents FOR SELECT
  TO authenticated
  USING (
    get_user_role() IN ('school_admin', 'principal') AND
    user_id IN (
      SELECT user_id FROM school_users WHERE school_id = get_user_school_id()
    )
  );

-- Parent students table policies
CREATE POLICY "Parents can view their children"
  ON parent_students FOR SELECT
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage parent-student relationships"
  ON parent_students FOR ALL
  TO authenticated
  USING (
    get_user_role() IN ('school_admin', 'principal') AND
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

-- Disciplinary records table policies
CREATE POLICY "Students can view their disciplinary records"
  ON disciplinary_records FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children's disciplinary records"
  ON disciplinary_records FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "School staff can manage disciplinary records"
  ON disciplinary_records FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    ) AND
    get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_school_users_school_user ON school_users(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_user ON students(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_user ON teachers(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_teacher ON classes(school_id, class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON messages(recipient_id, is_read);