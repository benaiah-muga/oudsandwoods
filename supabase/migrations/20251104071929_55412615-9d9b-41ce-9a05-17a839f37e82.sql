-- Add delivery_guy role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'delivery_guy';