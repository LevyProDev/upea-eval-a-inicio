-- Add 'teacher' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Add new columns to teachers table for complete profile
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS specialty text,
ADD COLUMN IF NOT EXISTS academic_degree text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS document_front_url text,
ADD COLUMN IF NOT EXISTS document_back_url text,
ADD COLUMN IF NOT EXISTS selfie_url text,
ADD COLUMN IF NOT EXISTS registration_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_number text;

-- Create unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS teachers_user_id_idx ON public.teachers(user_id);

-- Update RLS policies for teachers
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can create own teacher profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can update own teacher profile" ON public.teachers;

-- Anyone authenticated can view teachers (for student evaluations)
CREATE POLICY "Authenticated users can view teachers" 
ON public.teachers 
FOR SELECT 
TO authenticated
USING (true);

-- Teachers can insert their own profile
CREATE POLICY "Users can create own teacher profile" 
ON public.teachers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Teachers can update their own profile
CREATE POLICY "Users can update own teacher profile" 
ON public.teachers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger to assign teacher role on registration
CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert teacher role for this user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'teacher')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new teacher registration
DROP TRIGGER IF EXISTS on_teacher_created ON public.teachers;
CREATE TRIGGER on_teacher_created
  AFTER INSERT ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_teacher();