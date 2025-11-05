-- Fix admin_permissions RLS to allow super admin to insert
DROP POLICY IF EXISTS "Admins with manage_admins can grant permissions" ON admin_permissions;

CREATE POLICY "Admins with manage_admins can grant permissions"
ON admin_permissions
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_admins'));

-- Update the select policy to also work for super admin
DROP POLICY IF EXISTS "Admins with manage_admins can view permissions" ON admin_permissions;

CREATE POLICY "Admins with manage_admins can view permissions"
ON admin_permissions
FOR SELECT
USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_admins'));