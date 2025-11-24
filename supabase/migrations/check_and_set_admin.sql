-- Check and set admin flag for your admin user
-- Replace 'your-admin-email@example.com' with your actual admin email

-- First, check current admin status
SELECT id, email, raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'your-admin-email@example.com';

-- Copy the ID from the result above and use it in the next query
-- Replace 'USER_ID_HERE' with the actual user ID

-- Set is_admin flag to true
UPDATE profiles
SET is_admin = true
WHERE id = 'USER_ID_HERE';

-- Verify the change
SELECT id, full_name, is_admin
FROM profiles
WHERE is_admin = true;
