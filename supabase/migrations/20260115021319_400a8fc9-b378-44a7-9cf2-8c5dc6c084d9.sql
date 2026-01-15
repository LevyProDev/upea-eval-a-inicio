-- Drop the overly permissive policy that exposes all teacher data to students
DROP POLICY IF EXISTS "Students can view teachers of enrolled subjects" ON public.teachers;

-- Create a secure view that only exposes non-sensitive teacher information
-- Students can only see: id, first_name, last_name, department, specialty, academic_degree
CREATE OR REPLACE VIEW public.teachers_for_students AS
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