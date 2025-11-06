-- Allow admins to view all profiles and user roles for user management
BEGIN;

-- Profiles: allow admins and super admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

-- User roles: allow admins and super admins to view roles
CREATE POLICY "Admins can view user roles"
ON public.user_roles
FOR SELECT
USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

COMMIT;