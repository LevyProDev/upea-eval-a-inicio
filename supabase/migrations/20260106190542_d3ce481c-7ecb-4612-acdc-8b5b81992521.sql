-- Create director_profiles table
CREATE TABLE public.director_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  career_id UUID REFERENCES public.careers(id),
  faculty TEXT,
  position TEXT NOT NULL DEFAULT 'Director de Carrera',
  phone_number TEXT,
  document_type TEXT NOT NULL DEFAULT 'CI',
  document_number TEXT NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  registration_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_director_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.director_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for director_profiles
CREATE POLICY "Users can view own director profile"
  ON public.director_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own director profile"
  ON public.director_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own director profile"
  ON public.director_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all director profiles"
  ON public.director_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Directors can view all director profiles"
  ON public.director_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'director'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_director_profiles_updated_at
  BEFORE UPDATE ON public.director_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to assign director role when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_director()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'director')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_director_profile_created
  AFTER INSERT ON public.director_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_director();