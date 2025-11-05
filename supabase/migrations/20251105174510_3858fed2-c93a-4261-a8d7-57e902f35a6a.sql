-- Fix campaigns RLS policy to allow super admins
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

CREATE POLICY "Admins can manage campaigns"
ON public.campaigns
FOR ALL
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  public.is_super_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);