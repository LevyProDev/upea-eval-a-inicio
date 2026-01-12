-- Add restrictive RLS policies to user_roles table
-- These prevent direct manipulation while allowing trigger-based inserts

-- Prevent direct role insertion (only triggers should insert via SECURITY DEFINER)
CREATE POLICY "Only triggers can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (false);

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));