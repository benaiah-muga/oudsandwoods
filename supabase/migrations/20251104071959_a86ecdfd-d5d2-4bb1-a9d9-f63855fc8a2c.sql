-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'))
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'))
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_products'))
);

-- Add delivery fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_confirmation_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_delivery_guy UUID REFERENCES auth.users(id);

-- Create delivery_codes table
CREATE TABLE IF NOT EXISTS delivery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE delivery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery guys can view codes for assigned orders"
ON delivery_codes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = delivery_codes.order_id
    AND orders.assigned_delivery_guy = auth.uid()
  )
);

CREATE POLICY "Delivery guys can update codes for assigned orders"
ON delivery_codes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = delivery_codes.order_id
    AND orders.assigned_delivery_guy = auth.uid()
  )
);

CREATE POLICY "Admins can manage all delivery codes"
ON delivery_codes FOR ALL
USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_orders'));

-- Create visitor_logs table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  page_path TEXT,
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor logs"
ON visitor_logs FOR SELECT
USING (is_super_admin(auth.uid()) OR has_permission(auth.uid(), 'manage_orders'));

-- Update orders RLS to allow delivery guys to view assigned orders
CREATE POLICY "Delivery guys can view assigned orders"
ON orders FOR SELECT
USING (
  has_role(auth.uid(), 'delivery_guy') AND
  assigned_delivery_guy = auth.uid()
);

CREATE POLICY "Delivery guys can update assigned orders"
ON orders FOR UPDATE
USING (
  has_role(auth.uid(), 'delivery_guy') AND
  assigned_delivery_guy = auth.uid()
);

-- Update order_items RLS for delivery guys
CREATE POLICY "Delivery guys can view items for assigned orders"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.assigned_delivery_guy = auth.uid()
  )
);