-- Update profiles table for KYC back image
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS driver_license_back_image_url TEXT;

-- Update vehicles table for equipment and multiple images
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Update subscription_plans table for Stripe integration
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create storage bucket for vehicle images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to vehicle images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'vehicle-images' );

-- Create policy to allow authenticated users to upload vehicle images
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'vehicle-images' AND auth.role() = 'authenticated' );
