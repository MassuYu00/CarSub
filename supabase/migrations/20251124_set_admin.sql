-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set admin flag for carsub00@gmail.com
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'carsub00@gmail.com'
);

-- Verify the change
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.is_admin
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'carsub00@gmail.com';
