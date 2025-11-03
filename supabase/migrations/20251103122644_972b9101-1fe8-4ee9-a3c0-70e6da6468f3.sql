-- Create permissions enum
CREATE TYPE public.admin_permission AS ENUM (
  'manage_products',
  'manage_orders',
  'manage_admins',
  'view_analytics'
);

-- Create admin_permissions table
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission admin_permission NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission admin_permission)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  )
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email = 'benmukomya@gmail.com'
  )
$$;

-- RLS Policies for admin_permissions
CREATE POLICY "Super admin can manage all permissions"
ON public.admin_permissions
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Admins with manage_admins can view permissions"
ON public.admin_permissions
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_permission(auth.uid(), 'manage_admins')
);

CREATE POLICY "Admins with manage_admins can grant permissions"
ON public.admin_permissions
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) OR 
  public.has_permission(auth.uid(), 'manage_admins')
);

-- Update products RLS to use permissions
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (
  public.is_super_admin(auth.uid()) OR
  public.has_permission(auth.uid(), 'manage_products')
);

-- Update orders RLS to use permissions
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  public.has_permission(auth.uid(), 'manage_orders') OR
  auth.uid() = user_id
);

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR
  public.has_permission(auth.uid(), 'manage_orders')
);

-- Update order_items RLS
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR
  public.has_permission(auth.uid(), 'manage_orders') OR
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
  )
);