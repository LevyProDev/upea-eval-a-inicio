-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  administrative_position TEXT NOT NULL,
  department TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'CI',
  document_number TEXT NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  registration_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own admin profile"
ON public.admin_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own admin profile"
ON public.admin_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own admin profile"
ON public.admin_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all users for management
CREATE POLICY "Admins can view all admin profiles"
ON public.admin_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_admin_profile_created
AFTER INSERT ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_admin();

-- Allow admins to manage student_profiles
CREATE POLICY "Admins can view all student profiles"
ON public.student_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all student profiles"
ON public.student_profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage teachers
CREATE POLICY "Admins can update all teachers"
ON public.teachers
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert teachers"
ON public.teachers
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage careers
CREATE POLICY "Admins can insert careers"
ON public.careers
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update careers"
ON public.careers
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete careers"
ON public.careers
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage subjects
CREATE POLICY "Admins can insert subjects"
ON public.subjects
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subjects"
ON public.subjects
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subjects"
ON public.subjects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage subject_assignments
CREATE POLICY "Admins can insert subject assignments"
ON public.subject_assignments
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subject assignments"
ON public.subject_assignments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subject assignments"
ON public.subject_assignments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all evaluations for audit
CREATE POLICY "Admins can view all evaluations"
ON public.teacher_evaluations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.student_enrollments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage enrollments"
ON public.student_enrollments
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));