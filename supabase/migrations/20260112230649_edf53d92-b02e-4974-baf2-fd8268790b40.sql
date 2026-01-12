-- Drop the SECURITY DEFINER view (security risk)
DROP VIEW IF EXISTS public.teachers_public;

-- Create a secure function to get teacher basic info for students
-- This function returns only non-sensitive data and runs with invoker's permissions
CREATE OR REPLACE FUNCTION public.get_teacher_basic_info(teacher_id_param UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  specialty TEXT,
  academic_degree TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    t.id, 
    t.first_name, 
    t.last_name, 
    t.department, 
    t.specialty,
    t.academic_degree
  FROM public.teachers t
  WHERE t.id = teacher_id_param;
$$;

-- Add a policy that allows students to view only the teachers assigned to their enrolled subjects
-- This is more restrictive than viewing ALL teachers
CREATE POLICY "Students can view teachers of enrolled subjects"
ON public.teachers 
FOR SELECT 
USING (
  -- Check if the teacher is assigned to a subject the student is enrolled in
  EXISTS (
    SELECT 1 
    FROM public.student_profiles sp
    JOIN public.student_enrollments se ON se.student_id = sp.id
    JOIN public.subject_assignments sa ON sa.id = se.assignment_id
    WHERE sp.user_id = auth.uid()
    AND sa.teacher_id = teachers.id
  )
);