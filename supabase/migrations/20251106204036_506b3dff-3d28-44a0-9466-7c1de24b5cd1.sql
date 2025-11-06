-- Add reviewer_name column to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Update RLS policy to allow admins to insert reviews
CREATE POLICY "Admins can insert reviews" ON public.reviews
FOR INSERT 
WITH CHECK (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'::admin_permission) OR auth.uid() = user_id);

-- Update RLS policy to allow admins to delete reviews
CREATE POLICY "Admins can delete reviews" ON public.reviews
FOR DELETE 
USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'::admin_permission) OR auth.uid() = user_id);

-- Update RLS policy to allow admins to update reviews
CREATE POLICY "Admins can update reviews" ON public.reviews
FOR UPDATE 
USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'::admin_permission) OR auth.uid() = user_id);