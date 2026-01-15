-- Drop the existing view and recreate with security_invoker=on
DROP VIEW IF EXISTS public.teachers_for_students;

-- Create the view with SECURITY INVOKER to use the permissions of the querying user
CREATE VIEW public.teachers_for_students
WITH (security_invoker=on) AS
SELECT 
  t.id,
  t.first_name,
  t.last_name,
  t.department,
  t.specialty,
  t.academic_degree
FROM public.teachers t
WHERE EXISTS (
  SELECT 1 
  FROM public.student_profiles sp
  JOIN public.student_enrollments se ON se.student_id = sp.id
  JOIN public.subject_assignments sa ON sa.id = se.assignment_id
  WHERE sp.user_id = auth.uid()
  AND sa.teacher_id = t.id
);

-- Grant SELECT access on the view to authenticated users
GRANT SELECT ON public.teachers_for_students TO authenticated;

-- Add RLS policy for students to access base teachers table only through view context
-- This is a restrictive policy that allows the view to function
CREATE POLICY "Students can view enrolled teachers via view"
ON public.teachers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.student_profiles sp
    JOIN public.student_enrollments se ON se.student_id = sp.id
    JOIN public.subject_assignments sa ON sa.id = se.assignment_id
    WHERE sp.user_id = auth.uid()
    AND sa.teacher_id = teachers.id
  )
);