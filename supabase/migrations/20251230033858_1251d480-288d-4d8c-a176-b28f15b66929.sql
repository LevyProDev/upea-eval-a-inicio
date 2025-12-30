-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'student');

-- Tabla de roles de usuario (separada por seguridad)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Función para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Tabla de carreras
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  faculty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de perfiles de estudiantes
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'CI',
  birth_date DATE,
  phone_number TEXT,
  email TEXT NOT NULL,
  career_id UUID REFERENCES public.careers(id),
  semester INTEGER,
  enrollment_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  registration_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de docentes
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de materias
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  career_id UUID REFERENCES public.careers(id),
  semester INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de asignaciones (materia-docente-periodo)
CREATE TABLE public.subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  academic_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, teacher_id, period, academic_year)
);

-- Tabla de inscripciones de estudiantes en materias
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.subject_assignments(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

-- Tabla de evaluaciones docentes
CREATE TABLE public.teacher_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.subject_assignments(id) ON DELETE CASCADE NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 70),
  responses JSONB NOT NULL,
  blockchain_hash TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para crear rol al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- user_roles: usuarios pueden ver su propio rol
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- careers: todos pueden ver carreras
CREATE POLICY "Anyone can view careers"
  ON public.careers FOR SELECT
  TO authenticated
  USING (true);

-- student_profiles: usuarios pueden ver/crear/editar su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- teachers: usuarios autenticados pueden ver docentes
CREATE POLICY "Authenticated users can view teachers"
  ON public.teachers FOR SELECT
  TO authenticated
  USING (true);

-- subjects: usuarios autenticados pueden ver materias
CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

-- subject_assignments: usuarios autenticados pueden ver asignaciones activas
CREATE POLICY "Authenticated users can view active assignments"
  ON public.subject_assignments FOR SELECT
  TO authenticated
  USING (is_active = true);

-- student_enrollments: usuarios pueden ver sus propias inscripciones
CREATE POLICY "Users can view own enrollments"
  ON public.student_enrollments FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
    )
  );

-- teacher_evaluations: usuarios pueden ver/crear sus propias evaluaciones
CREATE POLICY "Users can view own evaluations"
  ON public.teacher_evaluations FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own evaluations"
  ON public.teacher_evaluations FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
    )
  );

-- Insertar datos iniciales de carreras
INSERT INTO public.careers (name, code, faculty) VALUES
  ('Ingeniería de Sistemas', 'SIS', 'Facultad de Ingeniería'),
  ('Ingeniería Civil', 'CIV', 'Facultad de Ingeniería'),
  ('Medicina', 'MED', 'Facultad de Ciencias de la Salud'),
  ('Derecho', 'DER', 'Facultad de Ciencias Jurídicas'),
  ('Administración de Empresas', 'ADM', 'Facultad de Ciencias Económicas');