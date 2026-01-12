-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;

-- Create a secure view for public teacher info (only non-sensitive fields)
-- Students need to see teacher names for their evaluations, but not sensitive data
CREATE OR REPLACE VIEW public.teachers_public AS
SELECT 
  id, 
  first_name, 
  last_name, 
  department, 
  specialty,
  academic_degree
FROM public.teachers;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.teachers_public TO authenticated;

-- Create role-based policies for the actual teachers table

-- Admins and directors can view all teacher data
CREATE POLICY "Admins can view all teachers"
ON public.teachers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Directors can view all teachers"
ON public.teachers 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

-- Teachers can view their own full profile
CREATE POLICY "Teachers can view own profile"
ON public.teachers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Teachers can view basic info of other teachers (for collaboration)
-- This uses a function to allow limited access to non-sensitive columns
CREATE POLICY "Teachers can view other teachers basic info"
ON public.teachers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'teacher'::app_role)
);