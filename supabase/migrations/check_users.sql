-- Check all users in profiles table
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.is_admin,
  p.verification_status,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Check if there are users in auth.users but not in profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  'Missing in profiles' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Count total users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE is_admin = false) as non_admin_profiles;
