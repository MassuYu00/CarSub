-- Add columns for driver license images if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS driver_license_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS driver_license_back_image_url TEXT;
