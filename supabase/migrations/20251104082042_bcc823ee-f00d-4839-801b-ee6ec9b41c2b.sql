-- Remove stock_quantity and add availability to products
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE public.products ADD COLUMN availability boolean DEFAULT true;

-- Ensure categories table exists with proper structure
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on categories if not already enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Create policies for categories
CREATE POLICY "Anyone can view categories"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'));

-- Add trigger for categories updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();