-- Rewritten supabase migration: safer, idempotent, checks existence,
-- clearer grants, and robust policy creation with DROP IF EXISTS before CREATE.
-- Filename: 20250919024606_dry_cottage_rewrite.sql

BEGIN;

-- 1) Enable RLS safely on tables only if they exist
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2) Helper functions: create or replace (idempotent)
-- These functions use auth.uid() which is provided by Supabase/Postgres auth-jwt.
-- They are SECURITY DEFINER so they run with the privileges of the definition owner.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  _r TEXT;
BEGIN
  SELECT role INTO _r FROM public.users WHERE id = auth.uid() LIMIT 1;
  IF _r IS NULL THEN
    RETURN 'guest';
  END IF;
  RETURN _r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID AS $$
DECLARE
  _s UUID;
BEGIN
  SELECT school_id INTO _s
  FROM public.school_users
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
  RETURN _s; -- returns null if not found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() IN ('super_admin', 'school_admin', 'principal');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Helper: safe drop-and-create policy macro via plpgsql loop isn't portable in migrations,
-- so we explicitly DROP policy IF EXISTS then CREATE policy. PostgreSQL supports DROP POLICY IF EXISTS.

-- Users table policies
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
CREATE POLICY "users_can_view_own_profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
CREATE POLICY "users_can_update_own_profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "admins_can_view_users_in_school" ON public.users;
CREATE POLICY "admins_can_view_users_in_school"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    public.is_admin() AND (
      public.get_user_role() = 'super_admin' OR
      id IN (
        SELECT user_id FROM public.school_users WHERE school_id = public.get_user_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "admins_can_create_users" ON public.users;
CREATE POLICY "admins_can_create_users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Schools table policies
DROP POLICY IF EXISTS "users_can_view_their_school" ON public.schools;
CREATE POLICY "users_can_view_their_school"
  ON public.schools FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_school_id() OR
    public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "school_admins_can_update_their_school" ON public.schools;
CREATE POLICY "school_admins_can_update_their_school"
  ON public.schools FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

DROP POLICY IF EXISTS "super_admins_manage_all_schools" ON public.schools;
CREATE POLICY "super_admins_manage_all_schools"
  ON public.schools FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'super_admin');

-- School users table policies
DROP POLICY IF EXISTS "users_can_view_school_associations" ON public.school_users;
CREATE POLICY "users_can_view_school_associations"
  ON public.school_users FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (public.is_admin() AND school_id = public.get_user_school_id()) OR
    public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "admins_manage_school_users" ON public.school_users;
CREATE POLICY "admins_manage_school_users"
  ON public.school_users FOR ALL
  TO authenticated
  USING (
    public.is_admin() AND (
      school_id = public.get_user_school_id() OR
      public.get_user_role() = 'super_admin'
    )
  );

-- Students table policies
DROP POLICY IF EXISTS "students_view_own_data" ON public.students;
CREATE POLICY "students_view_own_data"
  ON public.students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "parents_view_children" ON public.students;
CREATE POLICY "parents_view_children"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'parent' AND
    id IN (
      SELECT student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "school_staff_view_students" ON public.students;
CREATE POLICY "school_staff_view_students"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

DROP POLICY IF EXISTS "school_admins_manage_students" ON public.students;
CREATE POLICY "school_admins_manage_students"
  ON public.students FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Teachers table policies
DROP POLICY IF EXISTS "teachers_view_own_data" ON public.teachers;
CREATE POLICY "teachers_view_own_data"
  ON public.teachers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "school_staff_view_teachers" ON public.teachers;
CREATE POLICY "school_staff_view_teachers"
  ON public.teachers FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

DROP POLICY IF EXISTS "school_admins_manage_teachers" ON public.teachers;
CREATE POLICY "school_admins_manage_teachers"
  ON public.teachers FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Classes table policies
DROP POLICY IF EXISTS "school_members_view_classes" ON public.classes;
CREATE POLICY "school_members_view_classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_user_school_id() OR
    public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "school_admins_manage_classes" ON public.classes;
CREATE POLICY "school_admins_manage_classes"
  ON public.classes FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Attendance table policies
DROP POLICY IF EXISTS "students_view_attendance" ON public.attendance;
CREATE POLICY "students_view_attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "parents_view_attendance" ON public.attendance;
CREATE POLICY "parents_view_attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "teachers_manage_attendance" ON public.attendance;
CREATE POLICY "teachers_manage_attendance"
  ON public.attendance FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()
    ) AND
    public.get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Grades table policies
DROP POLICY IF EXISTS "students_view_grades" ON public.grades;
CREATE POLICY "students_view_grades"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "parents_view_grades" ON public.grades;
CREATE POLICY "parents_view_grades"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "teachers_manage_grades" ON public.grades;
CREATE POLICY "teachers_manage_grades"
  ON public.grades FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON c.id = s.class_id
      WHERE c.school_id = public.get_user_school_id()
    ) AND
    public.get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Fee structures table policies
DROP POLICY IF EXISTS "view_fee_structures" ON public.fee_structures;
CREATE POLICY "view_fee_structures"
  ON public.fee_structures FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_user_school_id() OR
    public.get_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "manage_fee_structures" ON public.fee_structures;
CREATE POLICY "manage_fee_structures"
  ON public.fee_structures FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Fee payments table policies
DROP POLICY IF EXISTS "students_view_payments" ON public.fee_payments;
CREATE POLICY "students_view_payments"
  ON public.fee_payments FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "parents_view_payments" ON public.fee_payments;
CREATE POLICY "parents_view_payments"
  ON public.fee_payments FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "staff_manage_payments" ON public.fee_payments;
CREATE POLICY "staff_manage_payments"
  ON public.fee_payments FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.school_id = public.get_user_school_id()
    ) AND
    public.get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- Announcements table policies
DROP POLICY IF EXISTS "view_announcements" ON public.announcements;
CREATE POLICY "view_announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    (
      is_published = true OR
      public.get_user_role() IN ('school_admin', 'principal', 'teacher')
    )
  );

DROP POLICY IF EXISTS "manage_announcements" ON public.announcements;
CREATE POLICY "manage_announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Events table policies
DROP POLICY IF EXISTS "view_events" ON public.events;
CREATE POLICY "view_events"
  ON public.events FOR SELECT
  TO authenticated
  USING (school_id = public.get_user_school_id());

DROP POLICY IF EXISTS "manage_events" ON public.events;
CREATE POLICY "manage_events"
  ON public.events FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal', 'teacher')
  );

-- Messages table policies
DROP POLICY IF EXISTS "users_view_messages" ON public.messages;
CREATE POLICY "users_view_messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "users_send_messages" ON public.messages;
CREATE POLICY "users_send_messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid() AND school_id = public.get_user_school_id());

DROP POLICY IF EXISTS "users_update_sent_messages" ON public.messages;
CREATE POLICY "users_update_sent_messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Notifications table policies
DROP POLICY IF EXISTS "users_view_notifications" ON public.notifications;
CREATE POLICY "users_view_notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_notifications" ON public.notifications;
CREATE POLICY "users_update_notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "system_create_notifications" ON public.notifications;
CREATE POLICY "system_create_notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System logs table policies
DROP POLICY IF EXISTS "admins_view_system_logs" ON public.system_logs;
CREATE POLICY "admins_view_system_logs"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('super_admin', 'school_admin') AND
    (school_id = public.get_user_school_id() OR public.get_user_role() = 'super_admin')
  );

DROP POLICY IF EXISTS "system_create_logs" ON public.system_logs;
CREATE POLICY "system_create_logs"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Academic terms table policies
DROP POLICY IF EXISTS "view_academic_terms" ON public.academic_terms;
CREATE POLICY "view_academic_terms"
  ON public.academic_terms FOR SELECT
  TO authenticated
  USING (school_id = public.get_user_school_id());

DROP POLICY IF EXISTS "manage_academic_terms" ON public.academic_terms;
CREATE POLICY "manage_academic_terms"
  ON public.academic_terms FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Subjects table policies
DROP POLICY IF EXISTS "view_subjects" ON public.subjects;
CREATE POLICY "view_subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (school_id = public.get_user_school_id());

DROP POLICY IF EXISTS "manage_subjects" ON public.subjects;
CREATE POLICY "manage_subjects"
  ON public.subjects FOR ALL
  TO authenticated
  USING (
    school_id = public.get_user_school_id() AND
    public.get_user_role() IN ('school_admin', 'principal')
  );

-- Class subjects table policies
DROP POLICY IF EXISTS "view_class_subjects" ON public.class_subjects;
CREATE POLICY "view_class_subjects"
  ON public.class_subjects FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT id FROM public.classes WHERE school_id = public.get_user_school_id())
  );

DROP POLICY IF EXISTS "teachers_manage_class_subjects" ON public.class_subjects;
CREATE POLICY "teachers_manage_class_subjects"
  ON public.class_subjects FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()
      AND (class_teacher_id = auth.uid() OR public.get_user_role() IN ('school_admin', 'principal'))
    )
  );

-- Timetables table policies
DROP POLICY IF EXISTS "view_timetables" ON public.timetables;
CREATE POLICY "view_timetables"
  ON public.timetables FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT id FROM public.classes WHERE school_id = public.get_user_school_id())
  );

DROP POLICY IF EXISTS "teachers_manage_timetables" ON public.timetables;
CREATE POLICY "teachers_manage_timetables"
  ON public.timetables FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid() OR (
      class_id IN (SELECT id FROM public.classes WHERE school_id = public.get_user_school_id()) AND
      public.get_user_role() IN ('school_admin', 'principal')
    )
  );

-- Parents & parent_students policies
DROP POLICY IF EXISTS "parents_view_own_data" ON public.parents;
CREATE POLICY "parents_view_own_data"
  ON public.parents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "parents_update_own_data" ON public.parents;
CREATE POLICY "parents_update_own_data"
  ON public.parents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "school_admins_view_parents" ON public.parents;
CREATE POLICY "school_admins_view_parents"
  ON public.parents FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('school_admin', 'principal') AND
    user_id IN (SELECT user_id FROM public.school_users WHERE school_id = public.get_user_school_id())
  );

DROP POLICY IF EXISTS "parents_view_children_relation" ON public.parent_students;
CREATE POLICY "parents_view_children_relation"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING (
    parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "school_admins_manage_parent_students" ON public.parent_students;
CREATE POLICY "school_admins_manage_parent_students"
  ON public.parent_students FOR ALL
  TO authenticated
  USING (
    public.get_user_role() IN ('school_admin', 'principal') AND
    student_id IN (SELECT id FROM public.students WHERE school_id = public.get_user_school_id())
  );

-- Disciplinary records policies
DROP POLICY IF EXISTS "students_view_disciplinary" ON public.disciplinary_records;
CREATE POLICY "students_view_disciplinary"
  ON public.disciplinary_records FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "parents_view_disciplinary" ON public.disciplinary_records;
CREATE POLICY "parents_view_disciplinary"
  ON public.disciplinary_records FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'parent' AND
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "staff_manage_disciplinary" ON public.disciplinary_records;
CREATE POLICY "staff_manage_disciplinary"
  ON public.disciplinary_records FOR ALL
  TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = public.get_user_school_id()) AND
    public.get_user_role() IN ('teacher', 'school_admin', 'principal')
  );

-- 4) Grants: be conservative but practical. Grant schema usage and common DML to the authenticated role.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5) Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_school_users_school_user ON public.school_users(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_user ON public.students(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_user ON public.teachers(school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_teacher ON public.classes(school_id, class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON public.grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON public.messages(recipient_id, is_read);

COMMIT;

-- End of migration
-- Notes:
-- 1) This migration is idempotent where possible (uses IF EXISTS or DROP IF EXISTS).
-- 2) PostgreSQL does not support CREATE POLICY IF NOT EXISTS, so we DROP policies first to ensure deterministic creation.
-- 3) Ensure the user that runs this migration has sufficient privileges to create functions with SECURITY DEFINER and to set grants/policies.
-- 4) After running, verify RLS is enabled and policies behave as expected with test users for each role.
